import { clerkClient, getAuth } from "@clerk/express";
import type { Request } from "express";
import { upsertUserByClerkId } from "../repositories/usersRepo.js";

export async function getCurrentUser(req: Request) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    throw Object.assign(new Error("Unauthenticated"), { statusCode: 401 });
  }

  const clerkUser = await clerkClient.users.getUser(auth.userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress ?? null;
  const displayName =
    clerkUser.fullName ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ??
    null;

  return upsertUserByClerkId({
    clerkUserId: auth.userId,
    email,
    displayName: displayName || email
  });
}
