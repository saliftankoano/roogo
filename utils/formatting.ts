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
 * Parses a formatted price string back to a number.
 * Removes non-numeric characters.
 * Example: "1 000 000" -> 1000000
 */
export const parsePrice = (formattedPrice: string): number | undefined => {
  const numericValue = formattedPrice.replace(/[^0-9]/g, "");
  return numericValue ? parseInt(numericValue, 10) : undefined;
};
