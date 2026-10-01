'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ErrorMessage } from '../../../components/ui/ErrorMessage';
import { useAuth } from '../../../hooks/useAuth';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

const adminLoginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormValues = z.infer<typeof adminLoginFormSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginFormSchema),
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      setApiError(null);
      await login(data);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setApiError(
        err.response?.data?.error?.message || 'Invalid admin credentials. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      <div className="w-full max-w-md space-y-6">
        {/* Admin Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0f6b4f] dark:bg-[#5cc9a0] text-white dark:text-[#0e1512] shadow-xs mb-1">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-heading text-3xl font-medium text-[#14201c] dark:text-[#ece9e1]">
            Municipal Admin Portal
          </h1>
          <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1]">
            Sign in with authorized municipal credentials
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-[#ffffff] dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-6 shadow-xs">
          {apiError && (
            <ErrorMessage
              title="Admin Authentication Failed"
              message={apiError}
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@city.gov"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Access Admin Dashboard
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-[#5d6b65] dark:text-[#9aa8a1] pt-2 border-t border-[#e5e1d8] dark:border-[#24312b]">
            Resident user?{' '}
            <Link
              href="/login"
              className="text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold hover:underline"
            >
              Sign In to Citizen Portal
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
