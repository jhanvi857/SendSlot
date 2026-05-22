import { S3Client, HeadObjectCommand, DeleteObjectsCommand, ListObjectsV2Command, GetObjectCommand, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const REGION = process.env.S3_REGION;

function createClient() {
  const opts: S3ClientConfig = { region: REGION };
  if (process.env.S3_ENDPOINT) {
    opts.endpoint = process.env.S3_ENDPOINT;
    opts.forcePathStyle = true;
  }
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    opts.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
  }
  return new S3Client(opts);
}

const client = createClient();
const BUCKET = process.env.S3_BUCKET;

async function getPresignedPutUrl(key: string, expiresSeconds = 900) {
  // For PUT we sign a PutObjectCommand but presigner accepts any command
  const { PutObjectCommand } = await import('@aws-sdk/client-s3');
  const put = new PutObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, put, { expiresIn: expiresSeconds });
}

async function getPresignedGetUrl(key: string, expiresSeconds = 300) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(client, cmd, { expiresIn: expiresSeconds });
}

async function headObject(key: string) {
  const cmd = new HeadObjectCommand({ Bucket: BUCKET, Key: key });
  return client.send(cmd);
}

async function deleteObjects(keys: string[] = []) {
  if (!keys.length) return;
  const cmd = new DeleteObjectsCommand({
    Bucket: BUCKET,
    Delete: { Objects: keys.map(k => ({ Key: k })) }
  });
  return client.send(cmd);
}

async function listObjectsWithPrefix(prefix: string) {
  const cmd = new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix });
  const res = await client.send(cmd);
  return (res.Contents || []).map(c => c.Key).filter((k): k is string => typeof k === 'string');
}

async function getObjectStream(key: string) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  const res = await client.send(cmd);
  return res.Body;
}

export { client, getPresignedPutUrl, getPresignedGetUrl, headObject, deleteObjects, listObjectsWithPrefix, getObjectStream };
