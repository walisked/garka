import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock auth API before importing to ensure login exists to spy on
vi.mock('../api/auth', () => ({ default: { login: vi.fn() } }));
import authAPI from '../api/auth';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const TestLogin = () => {
  const { login } = useAuth();
  return <button onClick={() => login('test@example.com', 'password')}>Login</button>;
};

describe('AuthContext', () => {
  it('logs in and stores user', async () => {
    vi.spyOn(authAPI, 'login').mockResolvedValue({ success: true, data: { token: 't', user: { fullName: 'Test', role: 'USER' } } });

    render(
      <AuthProvider>
        <TestLogin />
      </AuthProvider>
    );

    userEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(localStorage.getItem('digiagis_token')).toBe('t');
      expect(JSON.parse(localStorage.getItem('digiagis_user')).fullName).toBe('Test');
    });
  });
});
