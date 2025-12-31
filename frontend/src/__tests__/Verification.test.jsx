import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock verification API before importing to ensure the module has spyable functions
vi.mock('../api/verification', () => ({ requestVerification: vi.fn() }));
import * as verificationAPI from '../api/verification';
import Verification from '../pages/protected/Verification/Verification';
import { NotificationProvider } from '../contexts/NotificationContext';

describe('Verification page', () => {
  beforeEach(() => {
    localStorage.setItem('digiagis_token', 't');
    localStorage.setItem('digiagis_user', JSON.stringify({ fullName: 'Test User', role: 'USER' }));
  });

  it('submits verification request', async () => {
    vi.spyOn(verificationAPI, 'requestVerification').mockResolvedValue({ success: true, data: {} });

    render(
      <NotificationProvider>
        <Verification />
      </NotificationProvider>
    );

    userEvent.type(screen.getByLabelText(/Property ID/i), 'prop-123');
    userEvent.type(screen.getByLabelText(/Agent ID/i), 'agent-123');
    userEvent.click(screen.getByLabelText(/I accept the terms/i));

    userEvent.click(screen.getByRole('button', { name: /Request Verification/i }));

    await waitFor(() => {
      expect(verificationAPI.requestVerification).toHaveBeenCalled();
    });
  });
});
