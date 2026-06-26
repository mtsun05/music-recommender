import { SQSClient } from "@aws-sdk/client-sqs";
import { env } from "../env.js";

export const sqsClient = new SQSClient({
  region: env.AWS_REGION,
  endpoint: env.AWS_ENDPOINT_URL,
  credentials: env.AWS_ENDPOINT_URL
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test"
      }
    : undefined
});
