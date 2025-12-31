import { describe, it, expect, vi } from 'vitest';

// Mock axios before importing the auth API so the module uses the mocked client
vi.mock('axios', () => {
  const post = vi.fn().mockResolvedValue({ data: { success: true } });
  return { default: { create: vi.fn(() => ({ post })), __esModule: true } };
});

import { login, register } from '../api/auth';
import axios from 'axios';

describe('auth API smoke', () => {
  it('posts to /auth/login when login is called', async () => {
    // Dynamically import auth module so the axios mock is in place
    const auth = await import('../api/auth');
    const payload = { email: 'test@example.com', password: 'pw' };
    await auth.login(payload);

    // axios.create should have been called and returned client with post fn
    const axiosDefault = axios.default || axios;
    const create = axiosDefault.create;
    expect(create).toBeCalled();

    // Get the mocked post function from the created client
    const client = create.mock.results[0].value;
    expect(client.post).toBeCalledWith('/auth/login', payload);
  });

  it('posts to /auth/register when register is called', async () => {
    const auth = await import('../api/auth');
    const payload = { fullName: 'Test User', email: 't@example.com', password: 'pw' };
    await auth.register(payload);

    const axiosDefault = axios.default || axios;
    const create = axiosDefault.create;
    const client = create.mock.results[0].value;
    expect(client.post).toBeCalledWith('/auth/register', payload);
  });
});
