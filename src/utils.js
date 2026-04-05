/**
 * Compute HMAC-SHA256 signature for the given body and secret.
 * Returns a string in the format `sha256=<hex>` compatible with `X-Hub-Signature-256`.
 * Works in Node.js (uses crypto) and browsers (uses SubtleCrypto).
 */
export async function computeHmacSignature(secret, body) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body !== null && body !== void 0 ? body : '');
    // Browser environment with SubtleCrypto
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
        const enc = new TextEncoder();
        const key = await globalThis.crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(payload));
        const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
        return `sha256=${hex}`;
    }
    // Node.js fallback
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const crypto = require('crypto');
        const h = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        return `sha256=${h}`;
    }
    catch (e) {
        // As a last resort, return an empty signature
        throw new Error('No crypto implementation available to compute HMAC signature');
    }
}
