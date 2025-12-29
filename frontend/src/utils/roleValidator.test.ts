import { detectRoleByEmail, isGarkaEmail } from './roleValidator';
import { describe, it, expect } from 'vitest';

describe('roleValidator', () => {
  it('detects admin by local part', () => {
    expect(detectRoleByEmail('umar.admin@garka.com')).toBe('ADMIN');
    expect(detectRoleByEmail('admin@garka.com')).toBe('ADMIN');
  });

  it('detects agent', () => {
    expect(detectRoleByEmail('john.agent@garka.com')).toBe('AGENT');
  });

  it('detects deal initiator', () => {
    expect(detectRoleByEmail('omar.dealinitor@garka.com')).toBe('DEAL_INITIATOR');
  });

  it('defaults to USER for normal emails', () => {
    expect(detectRoleByEmail('jane.doe@gmail.com')).toBe('USER');
  });

  it('detects garka domain', () => {
    expect(isGarkaEmail('user@garka.com')).toBe(true);
    expect(isGarkaEmail('user@other.com')).toBe(false);
  });
});
