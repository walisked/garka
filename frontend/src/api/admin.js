import client from './index';

const adminAPI = {
  invite: async (data, token) => {
    const res = await client.post('/auth/invite', data, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  }
};

export default adminAPI;