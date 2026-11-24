'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { loginSchema, type LoginValues } from '../schemas';
import { useLogin } from '../hooks';
import { FormError } from './form-error';
import { PasswordInput } from './password-input';

const demoAccounts = [
  { name: 'Mohamed', email: 'mohamed@example.com' },
  { name: 'Ahmed', email: 'ahmed@example.com' },
];

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const login = useLogin();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Unable to sign in. Please try again.',
      );
    }
  };

  const fillDemo = (email: string) => {
    setServerError(null);
    form.setValue('email', email, { shouldValidate: true });
    form.setValue('password', 'Demo123!', { shouldValidate: true });
  };

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          Welcome back
        </p>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-slate-950">
          Sign in to DocSpace
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Pick up where you left off, or explore the demo workspace.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormError message={serverError} />

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register('email')}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={login.isPending}
        >
          {login.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Sign in <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white/70 p-4">
        <p className="text-xs font-medium text-slate-700">Demo accounts</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          One click fills the credentials. Password:{' '}
          <span className="font-mono text-[11px] text-slate-700">Demo123!</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account.email)}
              className="rounded-md border bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {account.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to DocSpace?{' '}
        <Link
          href="/register"
          className="font-medium text-slate-900 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
