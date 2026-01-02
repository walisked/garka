import env from '../config/env.js';

export const isGoogleMapsConfigured = () => !!env.GOOGLE_MAPS_API_KEY;
export const getGoogleMapsKey = () => env.GOOGLE_MAPS_API_KEY || null;
