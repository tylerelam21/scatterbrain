import { S3Client } from "@aws-sdk/client-s3";

// R2 speaks the S3 API — same SDK, just a different endpoint. Bucket is
// kept private; PRD §28 requires visibility enforced server-side, which a
// public bucket can't do on its own regardless of what the DB says.
export function getStorageClient(): S3Client {
  const endpoint = process.env.STORAGE_ENDPOINT;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Storage is not configured (STORAGE_ENDPOINT / STORAGE_ACCESS_KEY_ID / STORAGE_SECRET_ACCESS_KEY)");
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getStorageBucket(): string {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) throw new Error("STORAGE_BUCKET is not set");
  return bucket;
}
