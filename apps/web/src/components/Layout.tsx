import { UserButton } from "@clerk/clerk-react";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen p-5">
      <header className="mx-auto flex max-w-6xl items-center justify-between pb-6">
        <div>
          <span className="mr-2.5 inline-grid h-8 w-8 place-items-center rounded-lg bg-[#2ee982] font-black text-[#051008]">
            MR
          </span>
          <span className="font-extrabold">Music Recommender</span>
        </div>
        <UserButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
