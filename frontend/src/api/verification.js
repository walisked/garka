import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({ baseURL: API_BASE_URL });

const withAuth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const requestVerification = async (data, token) => {
  const res = await client.post('/verification', data, withAuth(token));
  return res.data;
};

export const approveVerification = async (id, adminNote, token) => {
  const res = await client.patch(`/verification/${id}/approve`, { adminNote }, withAuth(token));
  return res.data;
};

export const claimVerification = async (verificationId, token) => {
  const res = await client.post(`/deal-initiator/claim/${verificationId}`, {}, withAuth(token));
  return res.data;
};

export const getVerification = async (id, token) => {
  const res = await client.get(`/verification/${id}`, withAuth(token));
  return res.data;
};

const verificationAPI = {
  requestVerification,
  approveVerification,
  claimVerification,
  getVerification
};

export { verificationAPI };
export default verificationAPI;
