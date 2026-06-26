import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const root = createRoot(document.getElementById("root")!);

if (!publishableKey) {
  root.render(
    <StrictMode>
      <div className="grid min-h-screen place-content-center px-8 text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-[#e5efe9]">Music Recommender</h1>
        <p className="text-[#95ad9f]">
          Set VITE_CLERK_PUBLISHABLE_KEY in apps/web/.env.local to enable auth.
        </p>
      </div>
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    </StrictMode>
  );
}
