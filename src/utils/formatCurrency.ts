/**
 * Format number to Vietnamese currency (VND)
 * @param amount - The amount to format
 * @param showUnit - Whether to show "đ" or "VND" suffix
 * @returns Formatted string
 */
export function formatVND(amount: number, showUnit: boolean = true): string {
  const formatted = Math.round(amount).toLocaleString('vi-VN');
  return showUnit ? `${formatted} đ` : formatted;
}

/**
 * Format number to abbreviated form (k, M, B)
 * @param num - The number to format
 * @returns Formatted string with suffix
 */
export function formatCompactNumber(num: number): string {
  const absNum = Math.abs(num);
  
  if (absNum >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (absNum >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (absNum >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return Math.round(num).toString();
}

/**
 * Format input value with thousand separators as user types
 * @param value - The input value
 * @returns Formatted string
 */
export function formatInputNumber(value: string): string {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  
  // Convert to number and format
  if (numbers === '') return '';
  return parseInt(numbers).toLocaleString('vi-VN');
}

/**
 * Parse formatted input back to number
 * @param value - The formatted string
 * @returns Number value
 */
export function parseFormattedNumber(value: string): number {
  const numbers = value.replace(/\D/g, '');
  return numbers === '' ? 0 : parseInt(numbers);
}
