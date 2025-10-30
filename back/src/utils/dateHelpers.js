/**
 * Date utility functions for consistent date handling across the application
 * 
 * These helpers use local time instead of UTC to avoid timezone-related issues.
 * For example, a user in UTC+8 checking in at 23:30 local time and checking out
 * at 00:30 the next day (local) would be on different dates in UTC, causing
 * queries to fail when looking for "today's" attendance record.
 */

/**
 * Get today's date in YYYY-MM-DD format using local time
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getTodayDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a Date object as YYYY-MM-DD using local time
 * @param {Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

module.exports = {
  getTodayDate,
  formatDate
};
