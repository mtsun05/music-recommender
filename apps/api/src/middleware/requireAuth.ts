import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  return next();
}
