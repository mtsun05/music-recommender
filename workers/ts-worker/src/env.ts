import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL: z.string().url().optional(),
  SQS_RECOMMENDATION_QUEUE_URL: z.string().url(),
  WORKER_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3000)
});

export const env = envSchema.parse(process.env);
