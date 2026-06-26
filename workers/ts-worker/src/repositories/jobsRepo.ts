import { JobStatus } from "@music-recommender/shared";
import { query } from "../db/client.js";

export async function markJobRunning(jobId: string) {
  await query(
    `
      update jobs
      set status = $2, started_at = coalesce(started_at, now()), error_message = null
      where id = $1
    `,
    [jobId, JobStatus.Running]
  );
}

export async function markJobCompleted(jobId: string) {
  await query(
    `
      update jobs
      set status = $2, completed_at = now(), error_message = null
      where id = $1
    `,
    [jobId, JobStatus.Completed]
  );
}

export async function recordJobFailure(jobId: string, errorMessage: string) {
  const result = await query<{ status: string }>(
    `
      update jobs
      set
        attempts = attempts + 1,
        status = case when attempts + 1 >= max_attempts then $2 else $3 end,
        error_message = $4,
        completed_at = case when attempts + 1 >= max_attempts then now() else completed_at end
      where id = $1
      returning status
    `,
    [jobId, JobStatus.Failed, JobStatus.Queued, errorMessage]
  );

  return result.rows[0]?.status ?? JobStatus.Failed;
}
