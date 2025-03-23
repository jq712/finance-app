/**
 * Format a currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  /**
   * Format a percentage
   * @param {number} value - The value to format as percentage
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage string
   */
  export const formatPercentage = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  };
  
  /**
   * Truncate a string if it exceeds the specified length
   * @param {string} str - The string to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated string with ellipsis if needed
   */
  export const truncate = (str, length = 30) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return `${str.slice(0, length)}...`;
  };
  
  /**
   * Get the first letter of a string (for avatar)
   * @param {string} str - Input string
   * @returns {string} First letter capitalized
   */
  export const getInitial = (str) => {
    if (!str) return '?';
    return str.charAt(0).toUpperCase();
  };
  
  /**
   * Get a background color based on a string (for consistent avatar colors)
   * @param {string} str - Input string (like username)
   * @returns {string} CSS color
   */
  export const getAvatarColor = (str) => {
    if (!str) return '#1D9BF0';
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  };