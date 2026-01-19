/**
 * Formats a price string or number with spaces as thousands separators.
 * Example: 1000000 -> "1 000 000"
 */
export const formatPrice = (price: string | number | undefined): string => {
  if (price === undefined || price === null) return "";
  const stringPrice = price.toString();
  return stringPrice.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/**
 * Formats a price with the standard currency suffix (FCFA).
 * Example: 1000000 -> "1 000 000 FCFA"
 */
export const formatCurrency = (price: string | number | undefined): string => {
  if (price === undefined || price === null) return "";
  return `${formatPrice(price)} FCFA`;
};
