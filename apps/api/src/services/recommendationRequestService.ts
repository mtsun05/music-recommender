import {
  JobType,
  RecommendationRequestStatus,
  recommendationRequestCreateSchema,
  type RecommendationRequestCreateInput
} from "@music-recommender/shared";
import { createJob } from "../repositories/jobsRepo.js";
import {
  createRecommendationRequest,
  getRecommendationRequestForUser,
  getRecommendationResultItems
} from "../repositories/recommendationRequestsRepo.js";
import { enqueueRecommendationJob } from "./queueService.js";

function splitInput(input: string) {
  try {
    const parsed = new URL(input);
    return { inputUrl: parsed.toString(), inputText: null };
  } catch {
    return { inputUrl: null, inputText: input };
  }
}

export async function createRecommendationRequestForUser(
  userId: string,
  rawInput: RecommendationRequestCreateInput
) {
  const input = recommendationRequestCreateSchema.parse(rawInput);
  const { inputText, inputUrl } = splitInput(input.input);

  const request = await createRecommendationRequest({
    userId,
    requestType: input.requestType,
    inputText,
    inputUrl,
    requestedLimit: input.requestedLimit,
    filters: input.filters
  });

  const job = await createJob({
    jobType: JobType.GenerateRecommendations,
    userId,
    entityType: "recommendation_request",
    entityId: request.id,
    payload: { recommendationRequestId: request.id }
  });

  await enqueueRecommendationJob({
    jobType: JobType.GenerateRecommendations,
    jobId: job.id,
    recommendationRequestId: request.id,
    userId
  });

  return {
    requestId: request.id,
    status: RecommendationRequestStatus.Queued
  };
}

export async function getRecommendationRequestStatus(requestId: string, userId: string) {
  const request = await getRecommendationRequestForUser(requestId, userId);

  if (!request) {
    throw Object.assign(new Error("Recommendation request not found"), { statusCode: 404 });
  }

  const results =
    request.status === RecommendationRequestStatus.Completed
      ? await getRecommendationResultItems(requestId)
      : [];

  return {
    id: request.id,
    status: request.status,
    errorMessage: request.error_message,
    results
  };
}
