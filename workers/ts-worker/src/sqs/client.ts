import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
  type Message
} from "@aws-sdk/client-sqs";
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

export async function pollMessages(): Promise<Message[]> {
  const response = await sqsClient.send(
    new ReceiveMessageCommand({
      QueueUrl: env.SQS_RECOMMENDATION_QUEUE_URL,
      MaxNumberOfMessages: 5,
      WaitTimeSeconds: 10,
      VisibilityTimeout: 30
    })
  );

  return response.Messages ?? [];
}

export async function deleteMessage(receiptHandle: string) {
  await sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: env.SQS_RECOMMENDATION_QUEUE_URL,
      ReceiptHandle: receiptHandle
    })
  );
}
