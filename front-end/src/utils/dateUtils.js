import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';

/**
 * Format a date string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return format(dateObj, formatStr);
};

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  if (!isValid(dateObj)) return 'Invalid date';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Get the first day of the current month
 * @returns {Date} First day of the month
 */
export const getFirstDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the last day of the current month
 * @returns {Date} Last day of the month
 */
export const getLastDayOfMonth = () => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Format a date for API requests (YYYY-MM-DD)
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatApiDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Get the first day of the previous N months
 * @param {number} months - Number of months to go back
 * @returns {Date} First day of the month N months ago
 */
export const getFirstDayOfPreviousMonths = (months = 1) => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() - months, 1);
};