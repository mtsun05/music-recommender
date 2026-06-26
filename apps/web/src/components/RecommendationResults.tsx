import type { RecommendationResultItem } from "@music-recommender/shared";

export function RecommendationResults({ results }: { results: RecommendationResultItem[] }) {
  if (results.length === 0) {
    return <p className="muted">No results yet.</p>;
  }

  return (
    <ol className="results-list">
      {results.map((item) => (
        <li key={`${item.itemType}-${item.itemId}`}>
          <span className="rank">{item.rank}</span>
          <div>
            <strong>{item.title}</strong>
            <span>{item.artist ?? "Unknown artist"}</span>
            <p>{String(item.explanation?.reason ?? "Placeholder recommendation.")}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
