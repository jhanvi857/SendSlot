import express, { Request, Response } from "express";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { sql } from "../lib/db.js";
import {
  getPresignedPutUrl,
  getPresignedGetUrl,
  deleteObjects,
  headObject,
} from "../lib/s3.js";
import { Queue } from "bullmq";
import crypto from "crypto";
import { downloadLimiter } from "../middleware/rateLimit.js";
import redis from "../lib/redis.js";
import auth from "../middleware/auth.js";

const router = express.Router();
router.use(auth);

const connection = redis;
const fileQueue = new Queue("file-processing", { connection });
const emailQueue = new Queue("email-notify", { connection });

function isOwner(transfer: any, reqUser: any) {
  if (!transfer || !reqUser) return false;
  return transfer.user_id === reqUser.id || transfer.user_email === reqUser.email;
}

router.post("/", async (req: Request, res: Response) => {
  const {
    files,
    expiryDays = 7,
    downloadLimit,
    password,
    notify,
    email,
  } = req.body;
  if (!files || !Array.isArray(files) || files.length === 0) {
    res.status(400).json({ error: "files required" });
    return;
  }
  const slug = nanoid(6);
  const expires_at = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  const password_hash = password ? await bcrypt.hash(password, 10) : null;
  const userId = req.user?.id || null;
  const userEmail = email || req.user?.email || null;
  const r =
    await sql`INSERT INTO transfers (slug, expires_at, download_limit, password_hash, notify_on_download, user_email, user_id) VALUES (${slug}, ${expires_at}, ${downloadLimit || null}, ${password_hash}, ${notify ? true : false}, ${userEmail}, ${userId}) RETURNING id`;
  const transferId = r[0].id;
  const presignedUrls = [];
  for (const f of files) {
    const key = `uploads/${transferId}/${nanoid()}-${f.name}`;
    const url = await getPresignedPutUrl(key, 15 * 60);
    const finsert =
      await sql`INSERT INTO files (transfer_id, original_name, storage_key, mime_type, size_bytes) VALUES (${transferId}, ${f.name}, ${key}, ${f.type || null}, ${f.size}) RETURNING id`;
    presignedUrls.push({ name: f.name, url, key, fileId: finsert[0].id });
  }
  res.json({ slug, transferId, presignedUrls });
});

router.post("/:slug/complete", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const t = await sql`SELECT id FROM transfers WHERE slug=${slug}`;
  if (!t.length) return res.status(404).json({ error: "not found" });
  const transferId = t[0].id;
  await sql`UPDATE transfers SET status='processing' WHERE id=${transferId}`;
  await fileQueue.add("process", { transferId });
  res.json({ ok: true });
});

router.get("/mine", async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });

  const transfers = await sql`
    SELECT
      t.*,
      COUNT(f.id) AS file_count,
      COALESCE(SUM(f.size_bytes), 0) AS total_size_bytes
    FROM transfers t
    LEFT JOIN files f ON f.transfer_id = t.id
    WHERE t.user_id = ${req.user.id} OR t.user_email = ${req.user.email}
    GROUP BY t.id
    ORDER BY t.created_at DESC
  `;

  const filesByTransfer = await Promise.all(
    transfers.map(async (transfer) => {
      const files = await sql`
        SELECT id, original_name, storage_key, mime_type, size_bytes, checksum, scan_status, created_at
        FROM files
        WHERE transfer_id = ${transfer.id}
        ORDER BY created_at ASC
      `;
      return { transfer, files };
    })
  );

  res.json(filesByTransfer);
});

router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const t = await sql`SELECT * FROM transfers WHERE slug=${slug}`;
  if (!t.length) return res.status(404).json({ error: "not found" });
  const transfer = t[0];
  if (transfer.status === "expired")
    return res.status(410).json({ error: "expired" });
  if (transfer.password_hash) {
    const provided = req.headers["x-transfer-password"];
    if (!provided) return res.json({ protected: true });
    const passwordStr = Array.isArray(provided) ? provided[0] : provided;
    const ok = await bcrypt.compare(passwordStr, transfer.password_hash);
    if (!ok) return res.status(403).json({ error: "invalid password" });
  }
  const files =
    await sql`SELECT * FROM files WHERE transfer_id=${transfer.id} ORDER BY created_at`;
  res.json({ transfer, files });
});

router.post("/:slug/verify", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { password } = req.body;
  const t = await sql`SELECT password_hash FROM transfers WHERE slug=${slug}`;
  if (!t.length) return res.status(404).json({ error: "not found" });
  const ph = t[0].password_hash;
  if (!ph) return res.json({ valid: true });
  const valid = await bcrypt.compare(password || "", ph);
  res.json({ valid });
});

router.get("/:slug/download/:fileId", downloadLimiter, async (req: Request, res: Response) => {
  const { slug, fileId } = req.params;
  const t = await sql`SELECT * FROM transfers WHERE slug=${slug}`;
  if (!t.length) return res.status(404).json({ error: "not found" });
  const transfer = t[0];
  if (transfer.status !== "ready")
    return res.status(400).json({ error: "not ready" });
  if (new Date(transfer.expires_at) < new Date())
    return res.status(410).json({ error: "expired" });
  if (
    transfer.download_limit &&
    transfer.download_count >= transfer.download_limit
  )
    return res.status(403).json({ error: "download limit reached" });
  const f =
    await sql`SELECT * FROM files WHERE id=${fileId} AND transfer_id=${transfer.id}`;
  if (!f.length) return res.status(404).json({ error: "file not found" });
  const file = f[0];
  const url = await getPresignedGetUrl(file.storage_key, 300);
  // log download event
  const ip = req.ip || req.headers["x-forwarded-for"] || "";
  const ipHash = crypto
    .createHash("sha256")
    .update(Array.isArray(ip) ? ip[0] : ip.toString())
    .digest("hex");
  await sql`INSERT INTO download_events (transfer_id, file_id, ip_hash) VALUES (${transfer.id}, ${file.id}, ${ipHash})`;
  await sql`UPDATE transfers SET download_count = download_count + 1 WHERE id=${transfer.id}`;
  if (transfer.notify_on_download && transfer.user_email) {
    await emailQueue.add("notify", { transferId: transfer.id });
  }
  res.json({ url });
});

router.delete("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { password } = req.body || {};
  const t = await sql`SELECT * FROM transfers WHERE slug=${slug}`;
  if (!t.length) return res.status(404).json({ error: "not found" });
  const transfer = t[0];

  if (!isOwner(transfer, req.user)) {
    if (!transfer.password_hash) {
      return res.status(403).json({ error: "not authorized" });
    }
    if (!password) return res.status(403).json({ error: "password required" });
    const ok = await bcrypt.compare(password, transfer.password_hash);
    if (!ok) return res.status(403).json({ error: "invalid password" });
  }

  const files =
    await sql`SELECT storage_key FROM files WHERE transfer_id=${transfer.id}`;
  const keys: string[] = files.map((f) => f.storage_key);
  await deleteObjects(keys);
  await sql`DELETE FROM download_events WHERE transfer_id=${transfer.id}`;
  await sql`DELETE FROM transfers WHERE id=${transfer.id}`;
  res.json({ ok: true });
});

export default router;
