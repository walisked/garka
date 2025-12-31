import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock verification API before importing module
vi.mock('../src/api/verification.js', () => ({ default: { getVerification: vi.fn(), claimVerification: vi.fn() } }));
import verificationAPI from '../src/api/verification.js';
vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ user: { role: 'DEAL_INITIATOR' }, token: 'tok' }) }));
import VerificationDetails from '../src/pages/verification/VerificationDetails.jsx';

describe('VerificationDetails', () => {
  it('renders verification and allows claim', async () => {
    verificationAPI.getVerification = vi.fn().mockResolvedValue({ verification: { property: { title: 'Test' }, requestStatus: 'submitted', paymentStatus: 'pending', dealInitiatorInfo: null } });
    verificationAPI.claimVerification = vi.fn().mockResolvedValue({ success: true });

    render(<VerificationDetails verificationId="abc" />);

    await waitFor(() => expect(verificationAPI.getVerification).toHaveBeenCalled());
    expect(screen.getByText(/Property: Test/)).toBeInTheDocument();

    userEvent.click(screen.getByText('Claim'));
    await waitFor(() => expect(verificationAPI.claimVerification).toHaveBeenCalled());
  });
});