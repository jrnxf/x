import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "~/lib/env";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
  region: env.AWS_REGION,
});

export async function getPresignedS3Url(
  fileName: string,
  prefix = "media-skrrrt-final",
) {
  const key = `${prefix}/${Date.now()}__${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_BUCKET_NAME as string,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: 60 * 5, // 5 minutes
  });

  return url;
}
