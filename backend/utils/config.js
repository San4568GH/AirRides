import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path (go up two levels to project root)
const envPath = path.join(__dirname, '..', '..', '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

// Configuration object with validation and defaults
const config = {
  server: {
    port: process.env.PORT || 4000,
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.SERVER_SECRET,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  database: {
    mongoUrl: process.env.MONGO_URL,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  admin: {
    username: process.env.ADMIN_USERNAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};

// Validate required environment variables
const validateConfig = () => {
  const requiredFields = [
    'server.jwtSecret',
    'database.mongoUrl',
    'razorpay.keyId',
    'razorpay.keySecret',
    'admin.username',
    'admin.email',
    'admin.password',
  ];

  const missingFields = [];

  requiredFields.forEach(field => {
    const keys = field.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    console.log(`Checking ${field}: ${value ? 'Present' : 'Missing'}`);
    
    if (!value) {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    console.error('Missing required configuration values:');
    missingFields.forEach(field => {
      console.error(`  - ${field}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
};

// Validate configuration on import
validateConfig();

export default config;
