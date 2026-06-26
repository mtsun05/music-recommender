import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ENDPOINT_URL: z.string().url().optional(),
  SQS_RECOMMENDATION_QUEUE_URL: z.string().url()
});

export const env = envSchema.parse(process.env);
