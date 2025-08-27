// Frontend booking utilities

/**
 * Generate a unique booking ID (client-side)
 * Format: AR + timestamp + random hash
 * Example: AR17246789123ABC4D
 */
export const generateUniqueBookingId = () => {
  const timestamp = Date.now().toString();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AR${timestamp}${randomStr}`;
};

/**
 * Format booking ID for display
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

/**
 * Validate booking ID format
 * @param {string} bookingId - The booking ID to validate
 * @returns {boolean} - True if valid format
 */
export const validateBookingId = (bookingId) => {
  // Check if booking ID matches pattern: AR + digits + alphanumeric
  const pattern = /^AR\d+[A-Z0-9]+$/;
  return pattern.test(bookingId);
};

/**
 * Get booking age in days
 * @param {Date|string} bookingDate - The booking date
 * @returns {number} - Days since booking
 */
export const getBookingAge = (bookingDate) => {
  const booking = new Date(bookingDate);
  const now = new Date();
  const diffTime = Math.abs(now - booking);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Format booking status based on flight time
 * @param {Date|string} departureTime - Flight departure time
 * @returns {object} - Status info with color and text
 */
export const getFlightStatus = (departureTime) => {
  const departure = new Date(departureTime);
  const now = new Date();
  const hoursUntilFlight = (departure - now) / (1000 * 60 * 60);
  
  if (hoursUntilFlight < 0) {
    return { status: 'Completed', color: 'gray', emoji: '✈️' };
  } else if (hoursUntilFlight < 2) {
    return { status: 'Boarding', color: 'orange', emoji: '🚪' };
  } else if (hoursUntilFlight < 24) {
    return { status: 'Check-in Available', color: 'blue', emoji: '📋' };
  } else {
    return { status: 'Confirmed', color: 'green', emoji: '✅' };
  }
};
