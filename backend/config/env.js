import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

export default {
	// Server
	PORT: process.env.PORT || 5000,
	NODE_ENV: process.env.NODE_ENV || 'development',
  
	// Database
	MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI,
  
	// Security
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
	ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  
	// Payment
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
	// Storage
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
	// Commission Rates
	PLATFORM_COMMISSION: parseFloat(process.env.PLATFORM_COMMISSION) || 0.1,
	ADMIN_COMMISSION: parseFloat(process.env.ADMIN_COMMISSION) || 0.05,
  
	// Validation
	validate() {
		const required = ['MONGODB_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'];
		const missing = required.filter(key => !process.env[key]);
    
		if (missing.length > 0) {
			throw new Error(`Missing environment variables: ${missing.join(', ')}`);
		}
	}
};
