import { SendMessageCommand } from "@aws-sdk/client-sqs";
import type { RecommendationJobMessage } from "@music-recommender/shared";
import { env } from "../env.js";
import { sqsClient } from "../sqs/client.js";

export async function enqueueRecommendationJob(message: RecommendationJobMessage) {
  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: env.SQS_RECOMMENDATION_QUEUE_URL,
      MessageBody: JSON.stringify(message)
    })
  );
}
