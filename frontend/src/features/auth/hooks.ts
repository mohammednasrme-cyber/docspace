'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authApi } from './auth.api';
import type { LoginValues, RegisterValues } from './schemas';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: LoginValues) => authApi.login(values),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      router.replace('/documents');
      router.refresh();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: RegisterValues) =>
      authApi.register({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      router.replace('/documents');
      router.refresh();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
      toast.success('Signed out');
    },
    onError: () => {
      queryClient.clear();
      router.replace('/login');
      toast.error('Signed out locally');
    },
  });
}
