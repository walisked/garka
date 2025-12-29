export type UserRole = 'ADMIN' | 'AGENT' | 'DEAL_INITIATOR' | 'USER';

export const isGarkaEmail = (email: string) => /@garka\.com\s*$/i.test(email.trim());

export const detectRoleByEmail = (email: string): UserRole => {
  const local = email.split('@')[0] || '';
  const l = local.toLowerCase();
  if (l.includes('.admin') || l.endsWith('-admin') || l === 'admin') return 'ADMIN';
  if (l.includes('.agent') || l.endsWith('-agent') || l === 'agent') return 'AGENT';
  if (l.includes('.dealinitor') || l.includes('.dealinitiator') || l.includes('.dealin') || l === 'dealinitor') return 'DEAL_INITIATOR';
  return 'USER';
};

export const validateRoleEmail = (role: UserRole, email: string) => {
  if (role === 'USER') return true;
  return isGarkaEmail(email);
};
