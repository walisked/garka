import client from './index';

export const paymentsAPI = {
  initiateMonnify: async (data, token) => {
    const res = await client.post('/payment/monnify/initiate', data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },

  simulateComplete: async (verificationId, token) => {
    const res = await client.post(`/payment/simulate/${verificationId}/complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  }
};

export default paymentsAPI;