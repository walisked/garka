// typedef for runtime

export function isGarkaEmail(email: string) {
  return /@garka\.com\s*$/i.test(email.trim());
}

export function detectRoleByEmail(email: string) {
  const local = email.split('@')[0] || '';
  const l = local.toLowerCase();
  if (l.includes('.admin') || l.endsWith('-admin') || l === 'admin') return 'ADMIN';
  if (l.includes('.agent') || l.endsWith('-agent') || l === 'agent') return 'AGENT';
  if (l.includes('.dealinitor') || l.includes('.dealinitiator') || l.includes('.dealin') || l === 'dealinitor') return 'DEAL_INITIATOR';
  return 'USER';
}

export function validateRoleEmail(role: string, email: string) {
  if (role === 'USER') return true;
  return isGarkaEmail(email);
}

const roleUtils = { isGarkaEmail, detectRoleByEmail, validateRoleEmail };
export default roleUtils;

