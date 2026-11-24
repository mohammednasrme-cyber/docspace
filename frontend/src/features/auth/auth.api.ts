import { api } from '@/lib/api';
import type { AuthResponse, User } from './types';
import type { LoginValues, RegisterValues } from './schemas';

export const authApi = {
  me: () => api<AuthResponse>('/auth/me').then((response) => response.user),

  login: (values: LoginValues) =>
    api<AuthResponse>('/auth/login', {
      method: 'POST',
      json: values,
    }).then((response) => response.user),

  register: (values: Omit<RegisterValues, 'confirmPassword'>) =>
    api<AuthResponse>('/auth/register', {
      method: 'POST',
      json: values,
    }).then((response) => response.user),

  logout: () => api<{ success: boolean }>('/auth/logout', { method: 'POST' }),
};

export type AuthApiUser = User;
