import { RequestType } from "./constants.js";
import { recommendationRequestCreateSchema } from "./schemas.js";

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

console.log("recommendationRequestCreateSchema smoke test passed");
