import type { RecommendationResultItem } from "@music-recommender/shared";

export function RecommendationResults({ results }: { results: RecommendationResultItem[] }) {
  if (results.length === 0) {
    return <p className="text-[#95ad9f]">No results yet.</p>;
  }

  return (
    <ol className="grid list-none gap-3 p-0">
      {results.map((item) => (
        <li
          key={`${item.itemType}-${item.itemId}`}
          className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-lg border border-[#183a24] bg-[#09150d] p-3"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#70f2a3] font-black text-[#061008]">
            {item.rank}
          </span>
          <div>
            <strong className="block">{item.title}</strong>
            <span className="block">{item.artist ?? "Unknown artist"}</span>
            <p className="mt-1 text-[#95ad9f]">
              {String(item.explanation?.reason ?? "Placeholder recommendation.")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
