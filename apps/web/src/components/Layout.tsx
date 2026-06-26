import { UserButton } from "@clerk/clerk-react";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-mark">MR</span>
          <span className="brand-name">Music Recommender</span>
        </div>
        <UserButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
