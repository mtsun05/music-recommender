import { RequestType } from "./constants.js";
import { recommendationRequestCreateSchema, spotifyStatusResponseSchema } from "./schemas.js";

const parsed = recommendationRequestCreateSchema.parse({
  input: "in rainbows"
});

if (parsed.input !== "in rainbows") {
  throw new Error("Expected input to parse unchanged");
}

if (parsed.requestType !== RequestType.ItemBased) {
  throw new Error("Expected default request type");
}

if (parsed.requestedLimit !== 10) {
  throw new Error("Expected default requested limit");
}

const disconnectedSpotify = spotifyStatusResponseSchema.parse({
  connected: false,
  displayName: null,
  scopes: [],
  connectedAt: null
});

if (disconnectedSpotify.connected !== false) {
  throw new Error("Expected Spotify status to parse disconnected response");
}

console.log("recommendationRequestCreateSchema smoke test passed");
