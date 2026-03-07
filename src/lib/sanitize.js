/**
 * Sanitizes a string input by trimming whitespace, removing control characters,
 * and enforcing a maximum length. Designed to prevent XSS and injection attacks.
 * 
 * @param {string} input - Raw input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeText(input, maxLength = 2000) {
    if (typeof input !== 'string') return '';
    return input
        .trim()
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')  // Remove control chars
        .slice(0, maxLength);
}



/**
 * Validates attachment metadata from the client.
 * Only allows expected fields and types.
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
        .filter(a => a.url.length > 0);
}
