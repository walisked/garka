import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../src/pages/public/Login/Login.jsx';
import Signup from '../src/pages/public/Register/Register.jsx';
import { vi } from 'vitest';

// Mock useAuth for login/register
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: async () => ({ success: true }),
    register: async () => ({ success: true }),
  })
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Auth routing', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('navigates to marketplace after successful login', async () => {
    render(<Login />);

    userEvent.type(screen.getByLabelText(/Email Address/i), 'foo@example.com');
    userEvent.type(screen.getByLabelText(/Password/i), 'password');
    userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/marketplace');
    });
  });

  it('navigates to marketplace after successful registration', async () => {
    render(<Signup />);

    // Walk through steps to reach submit
    userEvent.click(screen.getByText(/Buyer \/ Seller/i));
    userEvent.click(screen.getByRole('button', { name: /Next/i }));

    userEvent.type(screen.getByLabelText(/First Name/i), 'John');
    userEvent.type(screen.getByLabelText(/Last Name/i), 'Doe');
    userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    userEvent.type(screen.getByLabelText(/Phone Number/i), '+2348012345678');
    userEvent.type(screen.getByLabelText(/Password/i), 'password');
    userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password');

    userEvent.click(screen.getByRole('button', { name: /Next/i }));
    userEvent.click(screen.getByLabelText(/agreeToTerms/i));

    userEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/marketplace');
    });
  });
});