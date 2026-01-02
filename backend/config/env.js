import dotenv from 'dotenv';

// Load environment variables from project root .env
dotenv.config();

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
  
	// Payment (Stripe)
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

	// Payment (Monnify)
	MONNIFY_CONTRACT_CODE: process.env.MONNIFY_CONTRACT_CODE,
	MONNIFY_API_KEY: process.env.MONNIFY_API_KEY,
	MONNIFY_API_SECRET: process.env.MONNIFY_API_SECRET,
	MONNIFY_SANDBOX: process.env.MONNIFY_SANDBOX === 'true',
	MONNIFY_AUTO_PAYOUT: process.env.MONNIFY_AUTO_PAYOUT === 'true',
	DEFAULT_PAYOUT_PROVIDER: process.env.DEFAULT_PAYOUT_PROVIDER || 'STRIPE',

	// Invite
	INVITE_TOKEN_EXPIRES: parseInt(process.env.INVITE_TOKEN_EXPIRES, 10) || (7 * 24 * 60 * 60 * 1000),

	// Monnify webhook age protection (seconds)
	MONNIFY_WEBHOOK_MAX_AGE_SECONDS: parseInt(process.env.MONNIFY_WEBHOOK_MAX_AGE_SECONDS, 10) || 86400,
  
	// Storage
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

	// HelloSign
	HELLOSIGN_API_KEY: process.env.HELLOSIGN_API_KEY,
	HELLOSIGN_API_SECRET: process.env.HELLOSIGN_API_SECRET,

	// Google Maps
	GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,

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
