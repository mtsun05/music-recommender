import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "../env.js";

const algorithm = "aes-256-gcm";

function getEncryptionKey() {
  if (!env.SPOTIFY_TOKEN_ENCRYPTION_KEY) {
    throw new Error("SPOTIFY_TOKEN_ENCRYPTION_KEY is required for Spotify token storage");
  }

  const raw = env.SPOTIFY_TOKEN_ENCRYPTION_KEY;
  const candidates = [Buffer.from(raw, "base64"), Buffer.from(raw, "hex"), Buffer.from(raw)];
  const key = candidates.find((candidate) => candidate.length === 32);

  if (!key) {
    throw new Error("SPOTIFY_TOKEN_ENCRYPTION_KEY must decode to 32 bytes");
  }

  return key;
}

export function encryptSpotifyToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSpotifyToken(encryptedToken: string) {
  const [ivPart, authTagPart, encryptedPart] = encryptedToken.split(".");

  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error("Invalid encrypted Spotify token");
  }

  const decipher = createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final()
  ]).toString("utf8");
}
