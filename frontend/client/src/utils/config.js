// Frontend environment configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
  clientUrl: import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'
};

export default config;
