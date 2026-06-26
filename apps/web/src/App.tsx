import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { DashboardPage } from "./pages/DashboardPage.js";
import { LandingPage } from "./pages/LandingPage.js";

export default function App() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <DashboardPage />
      </SignedIn>
    </>
  );
}
