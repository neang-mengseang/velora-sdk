/**
 * Compute HMAC-SHA256 signature for the given body and secret.
 * Returns a string in the format `sha256=<hex>` compatible with `X-Hub-Signature-256`.
 * Works in Node.js (uses crypto) and browsers (uses SubtleCrypto).
 */
export declare function computeHmacSignature(secret: string, body: unknown): Promise<string>;
