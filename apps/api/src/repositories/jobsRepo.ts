import { JobStatus } from "@music-recommender/shared";
import { query } from "../db/client.js";

type JobRow = {
  id: string;
  job_type: string;
  status: string;
};

export async function createJob(input: {
  jobType: string;
  userId: string;
  entityType: string;
  entityId: string;
  payload: Record<string, unknown>;
}) {
  const result = await query<JobRow>(
    `
      insert into jobs (job_type, status, user_id, entity_type, entity_id, payload)
      values ($1, $2, $3, $4, $5, $6)
      returning id, job_type, status
    `,
    [
      input.jobType,
      JobStatus.Queued,
      input.userId,
      input.entityType,
      input.entityId,
      JSON.stringify(input.payload)
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Failed to create job");
  }

  return row;
}

export async function markJobFailed(jobId: string, errorMessage: string) {
  await query(
    `
      update jobs
      set status = $2,
          error_message = $3,
          completed_at = now(),
          updated_at = now()
      where id = $1
    `,
    [jobId, JobStatus.Failed, errorMessage]
  );
}
