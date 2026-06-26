import type { RecommendationRequestStatusResponse } from "@music-recommender/shared";
import { RecommendationResults } from "./RecommendationResults.js";

export function RecommendationStatus({
  request
}: {
  request: RecommendationRequestStatusResponse | null;
}) {
  if (!request) {
    return <p className="muted">Submit a query to create your first recommendation request.</p>;
  }

  return (
    <section className="status-panel">
      <div className="status-header">
        <span className={`status-dot status-${request.status}`} />
        <div>
          <h2>Request status</h2>
          <p>{request.status}</p>
        </div>
      </div>
      {request.errorMessage ? <p className="error-text">{request.errorMessage}</p> : null}
      <RecommendationResults results={request.results} />
    </section>
  );
}
