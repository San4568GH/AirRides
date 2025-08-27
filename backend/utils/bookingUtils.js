// Utility functions for booking operations
import crypto from 'crypto';

/**
 * Generate a unique booking ID
 * Format: AR + timestamp + random hash
 * Example: AR17246789123ABC4D
 */
export const generateUniqueBookingId = () => {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AR${timestamp}${randomBytes}`;
};

/**
 * Validate booking ID format
 * @param {string} bookingId - The booking ID to validate
 * @returns {boolean} - True if valid format
 */
export const validateBookingId = (bookingId) => {
  // Check if booking ID matches pattern: AR + 13 digits + 6 hex characters
  const pattern = /^AR\d{13}[A-F0-9]{6}$/;
  return pattern.test(bookingId);
};

/**
 * Extract timestamp from booking ID
 * @param {string} bookingId - The booking ID
 * @returns {Date|null} - The timestamp when booking was created or null if invalid
 */
export const getBookingTimestamp = (bookingId) => {
  if (!validateBookingId(bookingId)) {
    return null;
  }
  
  const timestampStr = bookingId.slice(2, 15); // Extract timestamp part
  const timestamp = parseInt(timestampStr);
  return new Date(timestamp);
};

/**
 * Generate booking reference for display
 * @param {string} bookingId - The booking ID
 * @returns {string} - Formatted booking reference
 */
export const formatBookingReference = (bookingId) => {
  if (!bookingId) return 'N/A';
  
  // Format as: AR-XXXX-XXXX-XXXX for better readability
  if (bookingId.length >= 19) {
    return `${bookingId.slice(0, 2)}-${bookingId.slice(2, 6)}-${bookingId.slice(6, 10)}-${bookingId.slice(10)}`;
  }
  
  return bookingId;
};
