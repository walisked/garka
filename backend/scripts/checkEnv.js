require('dotenv').config();
console.log('✅ Environment loaded');
console.log('DB:', !!process.env.MONGODB_URI);
console.log('JWT:', !!process.env.JWT_SECRET);
console.log('ENCRYPTION_KEY present:', !!process.env.ENCRYPTION_KEY);
console.log('ENCRYPTION_KEY length:', process.env.ENCRYPTION_KEY ? process.env.ENCRYPTION_KEY.length : 0);
