import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

vi.mock('../src/contexts/AuthContext', () => ({ useAuth: () => ({ user: { isVerified: true }, token: 'tok' }) }));

// Mock backend API modules used by Marketplace/PaymentModal
vi.mock('../src/api/properties.js', () => ({ default: { list: async () => ({ properties: [{ _id: 'p1', title: 'Premium Plot in Maitama', location: { address: 'Maitama, Abuja' }, price: 45000000, status: 'available', images: [], agentId: null, features: [], visibleOnMap: false }] }) } }));
vi.mock('../src/api/verification.js', () => ({ default: { requestVerification: async () => ({ verification: { _id: 'v1', verificationFee: 5000 } }) } }));
vi.mock('../src/api/payments.js', () => ({ default: { initiateMonnify: async () => ({ data: { init: {} } }), simulateComplete: async () => ({ verification: { _id: 'v1', reservedUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() } }) } }));

// Mock PaymentModal component to avoid issues with local module imports during tests
vi.mock('../src/components/verification/PaymentModal', () => ({ default: ({ open, onSuccess, onClose, property }) => (
  <div data-testid="payment-modal">
    <button onClick={() => { onSuccess?.({ propertyId: property?.id, reservedUntil: Date.now() + 12 * 60 * 60 * 1000 }); }}>Pay Now</button>
  </div>
) }));

import { MemoryRouter } from 'react-router-dom';

describe('Marketplace flow', () => {
  beforeEach(() => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens payment and reserves property after payment', async () => {
    const { default: Marketplace } = await import('../src/pages/public/Marketplace/Marketplace.jsx');

    try {
      render(
        <MemoryRouter>
          <Marketplace />
        </MemoryRouter>
      );
    } catch (err) {
      console.error('Render error:', err);
      throw err;
    }

    // Open the property detail by title
    const title = await screen.findByText(/Premium Plot in Maitama/i);
    expect(title).toBeInTheDocument();

    userEvent.click(title);

    // Wait for Request Verification button in the dialog
    const requestBtn = await screen.findByRole('button', { name: /Request Verification/i });
    expect(requestBtn).toBeInTheDocument();

    userEvent.click(requestBtn);

    // Wait for Pay Now button in payment modal
    const payBtn = await screen.findByRole('button', { name: /Pay Now/i });
    expect(payBtn).toBeInTheDocument();

    userEvent.click(payBtn);

    // After payment, the card should show Reserved text
    await waitFor(() => expect(screen.getAllByText(/Reserved/i).length).toBeGreaterThan(0));
  });
});