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
