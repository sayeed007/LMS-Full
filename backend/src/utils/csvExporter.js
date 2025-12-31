/**
 * CSV Export Utility
 * Provides functions to export data to CSV format
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with label and key
 * @returns {String} CSV string
 */
const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create header row
  const headerRow = headers.map(h => escapeCSVField(h.label)).join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = getNestedValue(row, header.key);
      return escapeCSVField(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Get nested object value by dot notation string
 * @param {Object} obj - Object to get value from
 * @param {String} path - Dot notation path (e.g., 'user.name')
 * @returns {*} Value at path or empty string
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj) ?? '';
};

/**
 * Escape CSV field value
 * @param {*} field - Field value to escape
 * @returns {String} Escaped field value
 */
const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '';
  }

  // Convert to string
  let value = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    value = `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

/**
 * Format date for CSV export
 * @param {Date|String} date - Date to format
 * @returns {String} Formatted date string
 */
const formatDateForCSV = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Format time duration in seconds to readable format
 * @param {Number} seconds - Time in seconds
 * @returns {String} Formatted time string
 */
const formatTimeForCSV = (seconds) => {
  if (!seconds || seconds === 0) return '0 min';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return `${days} day(s) ${remainingHours} hour(s)`;
  }

  return `${hours} hour(s) ${minutes} min`;
};

module.exports = {
  convertToCSV,
  formatDateForCSV,
  formatTimeForCSV,
  getNestedValue,
  escapeCSVField
};
