import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerificationDetails from '../src/pages/verification/VerificationDetails.jsx';
import verificationAPI from '../src/api/verification.js';
import { vi } from 'vitest';

vi.mock('../src/api/verification.js');
vi.mock('../src/contexts/AuthContext.jsx', () => ({ useAuth: () => ({ user: { role: 'DEAL_INITIATOR' }, token: 'tok' }) }));

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