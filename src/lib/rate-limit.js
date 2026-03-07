// Simple in-memory rate limiter for serverless functions
// Stores IP -> [timestamps] map with sliding window

const rateStore = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5; // max 5 requests per IP per minute

export function rateLimit(ip) {
    const now = Date.now();
    const key = ip || 'unknown';

    if (!rateStore.has(key)) {
        rateStore.set(key, []);
    }

    const timestamps = rateStore.get(key).filter(t => now - t < WINDOW_MS);

    if (timestamps.length >= MAX_REQUESTS) {
        rateStore.set(key, timestamps);
        return {
            allowed: false,
            remaining: 0,
            resetIn: Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000),
        };
    }

    timestamps.push(now);
    rateStore.set(key, timestamps);

    // Cleanup old entries periodically
    if (rateStore.size > 1000) {
        for (const [k, v] of rateStore.entries()) {
            const filtered = v.filter(t => now - t < WINDOW_MS);
            if (filtered.length === 0) {
                rateStore.delete(k);
            }
        }
    }

    return {
        allowed: true,
        remaining: MAX_REQUESTS - timestamps.length,
        resetIn: Math.ceil(WINDOW_MS / 1000),
    };
}
