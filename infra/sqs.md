# SQS

The API sends `generate_recommendations` messages to `SQS_RECOMMENDATION_QUEUE_URL`.

Message shape:

```json
{
  "jobType": "generate_recommendations",
  "jobId": "uuid",
  "recommendationRequestId": "uuid",
  "userId": "uuid"
}
```

The TypeScript worker polls this queue, updates the durable `jobs` table, writes placeholder recommendation results, and deletes messages only after successful processing.

For local development, LocalStack creates a queue named `recommendation-jobs`.
