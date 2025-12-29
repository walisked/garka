import env from '../config/env.js';

export const isHelloSignConfigured = () => {
  return !!(env.HELLOSIGN_API_KEY && env.HELLOSIGN_API_SECRET);
};

export const getHelloSignConfig = () => ({
  apiKey: env.HELLOSIGN_API_KEY,
  apiSecret: env.HELLOSIGN_API_SECRET
});
