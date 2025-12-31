import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

const withAuth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const register = async (userData) => {
  const res = await client.post('/auth/register', userData);
  return res.data;
};

export const activateInvite = async (data) => {
  const res = await client.post('/auth/activate', data);
  return res.data;
};

export const login = async (data) => {
  const res = await client.post('/auth/login', data);
  return res.data;
};

export const updateProfile = async (userId, data, token) => {
  // backend expects PUT /auth/me for current user
  const res = await client.put('/auth/me', data, withAuth(token));
  return res.data;
};

export const changePassword = async (data, token) => {
  const res = await client.post('/auth/change-password', data, withAuth(token));
  return res.data;
};

export const logout = async (token) => {
  const res = await client.post('/auth/logout', {}, withAuth(token));
  return res.data;
};

export const refresh = async (refreshToken) => {
  // If backend expects refresh token in body
  try {
    const res = await client.post('/auth/refresh', { refreshToken });
    return res.data;
  } catch (err) {
    // Fallback: call without body (cookie-based refresh)
    const res = await client.post('/auth/refresh');
    return res.data;
  }
};

const authAPI = {
  register,
  activateInvite,
  login,
  updateProfile,
  changePassword,
  logout,
  refresh
};

export { authAPI };
export default authAPI;

// CommonJS interop for test environments that load this file as CJS
// (vitest / some bundler configs may expect functions on module.exports)
try {
  // eslint-disable-next-line no-undef
  if (typeof module !== 'undefined' && module.exports) {
    // assign both default and named exports to module.exports
    module.exports = authAPI;
    module.exports.register = register;
    module.exports.activateInvite = activateInvite;
    module.exports.login = login;
    module.exports.updateProfile = updateProfile;
    module.exports.changePassword = changePassword;
    module.exports.logout = logout;
    module.exports.refresh = refresh;
  }
} catch (e) {
  // ignore in strict ESM environments
}
