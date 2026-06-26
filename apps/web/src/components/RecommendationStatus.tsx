import type { RecommendationRequestStatusResponse } from "@music-recommender/shared";
import { RecommendationResults } from "./RecommendationResults.js";

const statusColorByStatus: Record<string, string> = {
  completed: "bg-[#2ee982]",
  failed: "bg-[#fb7185]",
  queued: "bg-[#facc15]",
  running: "bg-[#38bdf8]"
};

export function RecommendationStatus({
  request
}: {
  request: RecommendationRequestStatusResponse | null;
}) {
  if (!request) {
    return (
      <p className="text-[#95ad9f]">Submit a query to create your first recommendation request.</p>
    );
  }

  return (
    <section className="rounded-lg border border-[#163520] bg-[#06120a]/75 p-4">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`h-3 w-3 rounded-full ${statusColorByStatus[request.status] ?? "bg-gray-400"}`}
        />
        <div>
          <h2 className="text-base font-bold">Request status</h2>
          <p className="m-0">{request.status}</p>
        </div>
      </div>
      {request.errorMessage ? <p className="text-[#fda4af]">{request.errorMessage}</p> : null}
      <RecommendationResults results={request.results} />
    </section>
  );
}
