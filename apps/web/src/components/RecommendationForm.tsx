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
      className="my-6 grid items-end gap-3 min-[821px]:grid-cols-[minmax(0,1fr)_120px_auto]"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({ input, requestedLimit });
      }}
    >
      <label className="grid gap-2 text-sm font-bold text-[#a9c9b5]">
        Music URL or text query
        <input
          className="w-full rounded-lg border border-[#1f3f2b] bg-[#07140c] px-3.5 py-3 text-[#eefbf2] outline-none focus:border-[#38f58d] focus:ring-4 focus:ring-[#2ee982]/15"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Paste a Spotify URL or describe what you want"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#a9c9b5]">
        Limit
        <input
          className="w-full rounded-lg border border-[#1f3f2b] bg-[#07140c] px-3.5 py-3 text-[#eefbf2] outline-none focus:border-[#38f58d] focus:ring-4 focus:ring-[#2ee982]/15"
          min={1}
          max={50}
          type="number"
          value={requestedLimit}
          onChange={(event) => setRequestedLimit(Number(event.target.value))}
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="cursor-pointer rounded-lg bg-[#2ee982] px-4 py-3 font-bold text-[#031006] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Queueing..." : "Get recommendations"}
      </button>
    </form>
  );
}
