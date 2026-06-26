import { JobStatus, type RecommendationJobMessage } from "@music-recommender/shared";
import { markJobCompleted, markJobRunning, recordJobFailure } from "../repositories/jobsRepo.js";
import {
  createRecommendationResult,
  markRecommendationRequestCompleted,
  markRecommendationRequestFailed,
  markRecommendationRequestRunning
} from "../repositories/recommendationRequestsRepo.js";
import { generatePlaceholderRecommendations } from "../services/placeholderRecommendationService.js";

export async function handleGenerateRecommendations(message: RecommendationJobMessage) {
  try {
    await markJobRunning(message.jobId);
    await markRecommendationRequestRunning(message.recommendationRequestId);

    const items = await generatePlaceholderRecommendations(3);

    await createRecommendationResult({
      requestId: message.recommendationRequestId,
      userId: message.userId,
      items
    });

    await markRecommendationRequestCompleted(message.recommendationRequestId);
    await markJobCompleted(message.jobId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown worker error";
    const jobStatus = await recordJobFailure(message.jobId, errorMessage);

    if (jobStatus === JobStatus.Failed) {
      await markRecommendationRequestFailed(message.recommendationRequestId, errorMessage);
      return;
    }

    throw error;
  }
}
