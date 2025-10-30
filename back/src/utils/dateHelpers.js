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

/**
 * Get date range based on period
 * @param {string} period - 'today', 'week', or 'month'
 * @returns {object} Object with start and end dates
 */
const getDateRange = (period) => {
  const today = new Date();
  let start, end;

  switch (period) {
    case 'week':
      // Get start of current week (Monday)
      start = new Date(today);
      const dayOfWeek = start.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
      start.setDate(start.getDate() + diff);
      
      // Get end of current week (Sunday)
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      break;

    case 'month':
      // Get start of current month
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get end of current month
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;

    case 'today':
    default:
      start = new Date(today);
      end = new Date(today);
      break;
  }

  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

module.exports = {
  getTodayDate,
  formatDate,
  getDateRange
};
