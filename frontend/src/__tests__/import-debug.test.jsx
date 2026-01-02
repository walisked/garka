import { describe, it } from 'vitest';

describe.skip('import debug', () => {
  it('imports PaymentModal', async () => {
    const mod = await import('../components/verification/PaymentModal');
    console.log('PaymentModal module:', mod);
  });

  it('imports mui', async () => {
    const mui = await import('@mui/material');
    console.log('mui keys length:', Object.keys(mui).length);
  });

  it('imports marketplace', async () => {
    const m = await import('../pages/public/Marketplace/Marketplace');
    console.log('Marketplace module:', m);
  });
});
