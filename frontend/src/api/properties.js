import client from './index';

export const propertiesAPI = {
  list: async () => {
    const res = await client.get('/properties');
    return res.data;
  }
};

export default propertiesAPI;
