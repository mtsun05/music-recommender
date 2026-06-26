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
      <div className="config-screen">
        <h1>Music Recommender</h1>
        <p>Set VITE_CLERK_PUBLISHABLE_KEY in apps/web/.env.local to enable auth.</p>
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
