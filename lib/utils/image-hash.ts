import { createHash } from "node:crypto";

/**
 * Compute a SHA-256 hex digest of a raw byte buffer.
 * Used to fingerprint uploaded images so we can detect duplicate uploads
 * (same image uploaded twice should not create two rows).
 */
export function sha256Hex(bytes: ArrayBuffer | Uint8Array): string {
  const buf =
    bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return createHash("sha256").update(buf).digest("hex");
}

/**
 * Compute a combined fingerprint for a front+back pair.
 * Order-independent so swapping front/back still matches.
 */
export function pairFingerprint(frontHash: string, backHash?: string | null): string {
  if (!backHash) return `front:${frontHash}`;
  const [a, b] = [frontHash, backHash].sort();
  return `pair:${a}:${b}`;
}
