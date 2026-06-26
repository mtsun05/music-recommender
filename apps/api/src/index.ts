import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { recommendationRequestsRouter } from "./routes/recommendationRequests.js";
import { spotifyRouter } from "./routes/spotify.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(clerkMiddleware());

app.use("/health", healthRouter);
app.use("/me", meRouter);
app.use("/recommendation-requests", recommendationRequestsRouter);
app.use("/spotify", spotifyRouter);

app.use(
  (
    err: Error & { code?: string; issues?: unknown; retryable?: boolean; statusCode?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const statusCode = err.statusCode ?? (err.name === "ZodError" ? 400 : 500);
    res.status(statusCode).json({
      error: statusCode === 500 ? "Internal server error" : err.message,
      code: err.code,
      retryable: err.retryable,
      issues: err.issues
    });
  }
);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});
