export type UserRole = 'user' | 'admin' | 'superuser';

export interface User {
  userId: string;
  email: string;
  name: string;
  nickname?: string;
  role: UserRole;
  phone?: string;
  birthday?: string;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
} 