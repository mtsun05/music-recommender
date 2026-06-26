export const JobType = {
  GenerateRecommendations: "generate_recommendations"
} as const;

export const RecommendationRequestStatus = {
  Queued: "queued",
  Running: "running",
  Completed: "completed",
  Failed: "failed"
} as const;

export const JobStatus = {
  Queued: "queued",
  Running: "running",
  Completed: "completed",
  Failed: "failed"
} as const;

export const ItemType = {
  Track: "track",
  Album: "album",
  Artist: "artist",
  Playlist: "playlist"
} as const;

export const RequestType = {
  ItemBased: "item_based"
} as const;
