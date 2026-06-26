import { useState } from "react";

type Props = {
  onSubmit: (input: { input: string; requestedLimit: number }) => Promise<void>;
  isSubmitting: boolean;
};

export function RecommendationForm({ onSubmit, isSubmitting }: Props) {
  const [input, setInput] = useState("");
  const [requestedLimit, setRequestedLimit] = useState(10);

  return (
    <form
      className="recommendation-form"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({ input, requestedLimit });
      }}
    >
      <label>
        Music URL or text query
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste a Spotify URL or describe what you want"
          required
        />
      </label>
      <label>
        Limit
        <input
          min={1}
          max={50}
          type="number"
          value={requestedLimit}
          onChange={(event) => setRequestedLimit(Number(event.target.value))}
        />
      </label>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Queueing..." : "Get recommendations"}
      </button>
    </form>
  );
}
