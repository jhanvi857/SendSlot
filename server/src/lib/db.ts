import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL || '', { ssl: process.env.NODE_ENV === 'production' });

async function ensureSchema() {
  const schemaSql = `
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      user_id UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL,
      download_limit INT,
      download_count INT DEFAULT 0,
      password_hash TEXT,
      status TEXT DEFAULT 'pending',
      notify_on_download BOOLEAN DEFAULT false,
      user_email TEXT
    );

    CREATE TABLE IF NOT EXISTS files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transfer_id UUID NOT NULL REFERENCES transfers(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      mime_type TEXT,
      size_bytes BIGINT NOT NULL,
      checksum TEXT,
      scan_status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS download_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transfer_id UUID NOT NULL REFERENCES transfers(id),
      file_id UUID REFERENCES files(id),
      downloaded_at TIMESTAMPTZ DEFAULT now(),
      ip_hash TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_transfers_slug ON transfers(slug);
    CREATE INDEX IF NOT EXISTS idx_transfers_expires ON transfers(expires_at) WHERE status != 'expired';
    CREATE INDEX IF NOT EXISTS idx_files_transfer ON files(transfer_id);
  `;
  await sql.unsafe(schemaSql);
}

export { sql, ensureSchema };
