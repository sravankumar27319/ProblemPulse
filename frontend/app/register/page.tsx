'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const registerFormSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerAuth } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setApiError(null);
      await registerAuth(data);
      router.push('/');
    } catch (err: any) {
      setApiError(
        err.response?.data?.error?.message || 'Registration failed. Please check your information.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f4] dark:bg-[#0e1512] text-[#14201c] dark:text-[#ece9e1]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-heading text-3xl font-medium text-[#14201c] dark:text-[#ece9e1]">
              Create an Account
            </h1>
            <p className="text-sm text-[#5d6b65] dark:text-[#9aa8a1]">
              Register to report, track, and back civic issues in your neighborhood
            </p>
          </div>

          <Card className="p-6 sm:p-8 bg-[#ffffff] dark:bg-[#141d19] border border-[#e5e1d8] dark:border-[#24312b] space-y-6 shadow-xs">
            {apiError && (
              <ErrorMessage
                title="Registration Failed"
                message={apiError}
              />
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
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
                  Create Account
                </Button>
              </div>
            </form>

            <div className="text-center text-xs text-[#5d6b65] dark:text-[#9aa8a1] pt-2 border-t border-[#e5e1d8] dark:border-[#24312b]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#0f6b4f] dark:text-[#5cc9a0] font-semibold hover:underline"
              >
                Sign In Here
              </Link>
            </div>
          </Card>
        </div>
      </main>


    </div>
  );
}
