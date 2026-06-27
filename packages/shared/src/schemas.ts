import { z } from "zod";
import { ItemType, JobType, RecommendationRequestStatus, RequestType } from "./constants.js";

export const recommendationRequestCreateSchema = z.object({
  input: z.string().trim().min(1).max(2000),
  requestType: z.literal(RequestType.ItemBased).default(RequestType.ItemBased),
  requestedLimit: z.number().int().min(1).max(50).default(10),
  filters: z.record(z.unknown()).default({})
});

export const recommendationRequestCreateResponseSchema = z.object({
  requestId: z.string().uuid(),
  status: z.literal(RecommendationRequestStatus.Queued)
});

export const recommendationResultItemSchema = z.object({
  rank: z.number().int().positive(),
  itemType: z.enum([ItemType.Track, ItemType.Album, ItemType.Artist]),
  itemId: z.string().uuid(),
  title: z.string(),
  artist: z.string().nullable(),
  explanation: z.record(z.unknown()).nullable()
});

export const recommendationRequestStatusResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    RecommendationRequestStatus.Queued,
    RecommendationRequestStatus.Running,
    RecommendationRequestStatus.Completed,
    RecommendationRequestStatus.Failed
  ]),
  errorMessage: z.string().nullable().optional(),
  results: z.array(recommendationResultItemSchema)
});

export const currentUserResponseSchema = z.object({
  id: z.string().uuid(),
  clerkUserId: z.string(),
  email: z.string().nullable(),
  displayName: z.string().nullable()
});

export const spotifyStatusResponseSchema = z.object({
  connected: z.boolean(),
  displayName: z.string().nullable(),
  scopes: z.array(z.string()),
  connectedAt: z.string().nullable()
});

export const spotifyDisconnectResponseSchema = z.object({
  connected: z.literal(false)
});

export const recommendationJobMessageSchema = z.object({
  jobType: z.literal(JobType.GenerateRecommendations),
  jobId: z.string().uuid(),
  recommendationRequestId: z.string().uuid(),
  userId: z.string().uuid()
});

export type RecommendationRequestCreateInput = z.infer<typeof recommendationRequestCreateSchema>;
export type RecommendationRequestCreateResponse = z.infer<
  typeof recommendationRequestCreateResponseSchema
>;
export type RecommendationRequestStatusResponse = z.infer<
  typeof recommendationRequestStatusResponseSchema
>;
export type RecommendationResultItem = z.infer<typeof recommendationResultItemSchema>;
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
export type SpotifyStatusResponse = z.infer<typeof spotifyStatusResponseSchema>;
export type SpotifyDisconnectResponse = z.infer<typeof spotifyDisconnectResponseSchema>;
export type RecommendationJobMessage = z.infer<typeof recommendationJobMessageSchema>;
