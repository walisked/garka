export type UserRole = 'ADMIN' | 'AGENT' | 'DEAL_INITIATOR' | 'USER';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}
