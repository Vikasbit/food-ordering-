/**
 * Centralized INR currency formatter for BIGBITES.
 * All customer-facing prices should use formatINR().
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

/**
 * Format a numeric value as Indian Rupees.
 * @param {number|string} value - The numeric price value
 * @returns {string} Formatted price string e.g. "₹329"
 */
export const formatINR = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  return inrFormatter.format(num);
};

/**
 * Parse a price value (string or number) into a clean number.
 * Handles strings like "₹329", "$12.99", "329", etc.
 * @param {number|string} value - The price to parse
 * @returns {number} Clean numeric price
 */
export const parsePrice = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
};
