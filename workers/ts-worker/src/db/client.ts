import pg from "pg";
import { env } from "../env.js";

export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

export async function query<T extends pg.QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result;
}
