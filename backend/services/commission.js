export function calculateCommission(amount) {
  return {
    platform: amount * 0.1,
    admin: amount * 0.05,
    crm: amount * 0.1,
    net: amount * 0.75
  };
}
