/**
 * Sanitizes a string input by trimming whitespace, removing control characters,
 * stripping HTML tags, and enforcing a maximum length.
 * 
 * Note: HTML entity encoding is not applied because the data is stored in Postgres
 * and rendered through React JSX, which already escapes output.
 * 
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeText(input, maxLength = 2000) {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/<[^>]*>/g, '')
        .slice(0, maxLength);
}

/**
 * Validates that a URL points to the configured Supabase storage domain.
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if the URL is from the Supabase storage domain
 */
function isValidStorageUrl(url) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false;
    try {
        const parsed = new URL(url);
        const allowed = new URL(supabaseUrl);
        return parsed.hostname === allowed.hostname && parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validates attachment metadata from the client.
 * Only allows expected fields, types, and URLs from the Supabase storage domain.
 * 
 * @param {Array} attachments - Array of attachment objects
 * @returns {Array} Sanitized attachments
 */
export function sanitizeAttachments(attachments) {
    if (!Array.isArray(attachments)) return [];
    return attachments
        .slice(0, 3)
        .filter(a => a && typeof a === 'object')
        .map(a => ({
            url: typeof a.url === 'string' ? a.url.slice(0, 1000) : '',
            name: typeof a.name === 'string' ? sanitizeText(a.name, 200) : 'file',
            type: typeof a.type === 'string' ? a.type.slice(0, 50) : '',
        }))
        .filter(a => a.url.length > 0 && isValidStorageUrl(a.url));
}
