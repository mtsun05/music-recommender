import { JobType, recommendationJobMessageSchema } from "@music-recommender/shared";
import { env } from "./env.js";
import { handleGenerateRecommendations } from "./handlers/generateRecommendations.js";
import { deleteMessage, pollMessages } from "./sqs/client.js";

async function handleMessage(body: string) {
  const message = recommendationJobMessageSchema.parse(JSON.parse(body));

  switch (message.jobType) {
    case JobType.GenerateRecommendations:
      await handleGenerateRecommendations(message);
      break;
  }
}

async function runWorker() {
  console.log("TypeScript worker polling SQS");

  while (true) {
    const messages = await pollMessages();

    for (const message of messages) {
      if (!message.Body || !message.ReceiptHandle) {
        continue;
      }

      try {
        await handleMessage(message.Body);
        await deleteMessage(message.ReceiptHandle);
      } catch (error) {
        console.error("Failed to process SQS message", error);
      }
    }

    if (messages.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, env.WORKER_POLL_INTERVAL_MS));
    }
  }
}

runWorker().catch((error) => {
  console.error("Worker crashed", error);
  process.exit(1);
});
