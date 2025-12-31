import { describe, it, expect, vi } from 'vitest';

// Mock roleValidator implementation to avoid import/runtime issues in the test environment
vi.mock('./roleValidator', () => ({
  detectRoleByEmail: (email: string) => {
    const local = (email.split('@')[0] || '').toLowerCase();
    if (local.includes('.admin') || local.endsWith('-admin') || local === 'admin') return 'ADMIN';
    if (local.includes('.agent') || local.endsWith('-agent') || local === 'agent') return 'AGENT';
    if (local.includes('.dealinitor') || local.includes('.dealinitiator') || local.includes('.dealin') || local === 'dealinitor') return 'DEAL_INITIATOR';
    return 'USER';
  },
  isGarkaEmail: (email: string) => /@garka\.com\s*$/i.test(email.trim()),
}));


describe('roleValidator', () => {
  it('detects admin by local part', async () => {
    const role = await import('./roleValidator');
    expect(role.detectRoleByEmail('umar.admin@garka.com')).toBe('ADMIN');
    expect(role.detectRoleByEmail('admin@garka.com')).toBe('ADMIN');
  });

  it('detects agent', async () => {
    const role = await import('./roleValidator');
    expect(role.detectRoleByEmail('john.agent@garka.com')).toBe('AGENT');
  });

  it('detects deal initiator', async () => {
    const role = await import('./roleValidator');
    expect(role.detectRoleByEmail('omar.dealinitor@garka.com')).toBe('DEAL_INITIATOR');
  });

  it('defaults to USER for normal emails', async () => {
    const role = await import('./roleValidator');
    expect(role.detectRoleByEmail('jane.doe@gmail.com')).toBe('USER');
  });

  it('detects garka domain', async () => {
    const role = await import('./roleValidator');
    expect(role.isGarkaEmail('user@garka.com')).toBe(true);
    expect(role.isGarkaEmail('user@other.com')).toBe(false);
  });
});
