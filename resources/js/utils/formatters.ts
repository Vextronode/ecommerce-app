const rupiahFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
});
const idFormatter = new Intl.NumberFormat("id-ID");
const enFormatter = new Intl.NumberFormat("en-US");

export const formatRupiah = (number: number) => rupiahFormatter.format(number);
export const formatNumberId = (number: number) => idFormatter.format(number);
export const formatNumberEn = (number: number) => enFormatter.format(number);

/**
 * Format angka atau string angka ke format Rupiah dengan pemisah ribuan titik (contoh: 35000 -> "35.000").
 */
export const formatRupiahNumber = (
    value: number | string | null | undefined
): string => {
    if (value === null || value === undefined || value === "") return "";
    const num = typeof value === "number" ? Math.round(value) : parseRupiahInput(value);
    if (isNaN(num) || num === 0) return "";
    return idFormatter.format(num);
};

export const formatRupiahDisplay = formatRupiahNumber;

/**
 * Parsing input teks atau angka ke nominal integer bersih.
 * Mendukung format angka biasa, bertitik ("35.000"),
 * serta shortcut seperti "35k", "35.5k", "35rb", "1.5jt", "1.5m".
 */
export const parseRupiahInput = (
    input: string | number | null | undefined
): number => {
    if (input === null || input === undefined || input === "") return 0;
    if (typeof input === "number") return Math.round(input);

    let str = String(input).trim().toLowerCase();
    if (!str) return 0;

    // Check for suffix shortcuts: k, rb, jt, m
    const hasJt = str.includes("jt") || str.endsWith("m");
    const hasK = str.includes("k") || str.includes("rb");

    if (hasJt || hasK) {
        let numPart = str
            .replace(/rp/g, "")
            .replace(/jt/g, "")
            .replace(/rb/g, "")
            .replace(/k/g, "")
            .replace(/m/g, "")
            .trim()
            .replace(/,/g, ".");

        const multiplier = hasJt ? 1_000_000 : 1_000;
        const parsed = parseFloat(numPart);
        if (!isNaN(parsed)) {
            return Math.round(parsed * multiplier);
        }
    }

    // Remove "Rp" or "rp" prefix and whitespace
    str = str.replace(/^rp\s*/i, "").trim();

    // 1. Check if it's standard database decimal string: e.g. "30000.00", "25500.50", "1500.0"
    // Matches digits followed by a single dot and 1 or 2 decimals (NOT 3 decimals, which is thousands in IDR)
    if (/^\d+\.\d{1,2}$/.test(str)) {
        const parsed = parseFloat(str);
        if (!isNaN(parsed)) {
            return Math.round(parsed);
        }
    }

    // 2. Check if it's Indonesian decimal format with comma: e.g. "30.000,00" or "30000,00" or "30,00"
    if (/,\d{1,2}$/.test(str)) {
        str = str.replace(/,\d{1,2}$/, "");
    }

    // 3. If there is a dot followed by 2 decimals at the end after dots, e.g. "30.000.00"
    if (/\.\d{2}$/.test(str) && str.indexOf(".") !== str.lastIndexOf(".")) {
        str = str.replace(/\.\d{2}$/, "");
    }

    // 4. Default: remove all non-digits (thousand separator dots, spaces, etc.)
    const cleaned = str.replace(/\D/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
};

/**
 * Helper untuk event onChange pada input Rupiah.
 * Mengembalikan nominal angka bersih (raw) dan string berformat titik (formatted).
 */
export const handleRupiahInputChange = (
    input: string
): { raw: number; formatted: string } => {
    if (!input) {
        return { raw: 0, formatted: "" };
    }

    const trimmed = input.trim().toLowerCase();

    // Jika user mengetik shortcut k, rb, jt
    if (
        trimmed.includes("k") ||
        trimmed.includes("rb") ||
        trimmed.includes("jt")
    ) {
        const raw = parseRupiahInput(trimmed);
        return {
            raw,
            formatted: raw > 0 ? formatRupiahNumber(raw) : "",
        };
    }

    const digits = trimmed.replace(/\D/g, "");
    if (!digits) {
        return { raw: 0, formatted: "" };
    }

    const raw = parseInt(digits, 10);
    return {
        raw,
        formatted: formatRupiahNumber(raw),
    };
};
