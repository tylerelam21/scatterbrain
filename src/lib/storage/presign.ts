import { createId } from "@paralleldrive/cuid2";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getStorageBucket, getStorageClient } from "./client";

const UPLOAD_URL_TTL_SECONDS = 300;
const DOWNLOAD_URL_TTL_SECONDS = 300;

export function generateStorageKey(originalFilename: string): string {
  const ext = originalFilename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `photos/${createId()}.${ext}`;
}

export async function getPresignedUploadUrl(
  storageKey: string,
  contentType: string,
): Promise<string> {
  const client = getStorageClient();
  const command = new PutObjectCommand({
    Bucket: getStorageBucket(),
    Key: storageKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS });
}

export async function getPresignedDownloadUrl(storageKey: string): Promise<string> {
  const client = getStorageClient();
  const command = new GetObjectCommand({ Bucket: getStorageBucket(), Key: storageKey });
  return getSignedUrl(client, command, { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
}

export async function deleteStorageObject(storageKey: string): Promise<void> {
  const client = getStorageClient();
  await client.send(new DeleteObjectCommand({ Bucket: getStorageBucket(), Key: storageKey }));
}
