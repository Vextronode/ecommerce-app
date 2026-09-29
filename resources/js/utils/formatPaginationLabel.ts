/**
 * Safely decodes common HTML entities returned by Laravel pagination
 * (&laquo;, &raquo;, etc.) into plain text without requiring dangerouslySetInnerHTML.
 */
export function formatPaginationLabel(label: string): string {
    if (!label) return "";
    return label
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}
