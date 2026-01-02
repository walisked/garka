import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock API before importing module so the imported api is the mocked object
vi.mock('../src/api/index.js', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
import api from '../src/api/index.js';
import AdminPayouts from '../src/pages/admin/AdminPayouts.jsx';

describe('AdminPayouts', () => {
  it('renders payouts and processes a payout', async () => {
    api.get = vi.fn().mockResolvedValue({ data: { payouts: [{ _id: '1', type: 'PAYOUT_AGENT', amount: 1000, recipient: 'user1' }] } });
    api.post = vi.fn().mockResolvedValue({ data: { success: true } });

    render(<AdminPayouts />);

    await waitFor(() => expect(api.get).toHaveBeenCalled());

    expect(screen.getByText(/PAYOUT_AGENT/)).toBeInTheDocument();

    userEvent.click(screen.getByText('Process'));

    await waitFor(() => expect(api.post).toHaveBeenCalled());
  });
});