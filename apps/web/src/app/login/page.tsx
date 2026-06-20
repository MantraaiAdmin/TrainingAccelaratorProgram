'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND } from '@/lib/branding';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.warmUp();
    router.prefetch('/dashboard');
    router.prefetch('/admin');
  }, [router]);

  const clearAutofill = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.removeAttribute('readonly');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await api.login(email, password);
      setAuth(result.user as never, result.accessToken, result.refreshToken);
      toast.success('Welcome back!');
      const user = result.user as { role: string };
      router.push(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      const message = (err as Error).message || 'Login failed';
      if (message.toLowerCase().includes('invalid credentials')) {
        toast.error('Invalid email or password. Ask your admin to create your student account.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <Image
                src="/mantra-ai-icon.png"
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl"
                priority
              />
              <div>
                <h1 className="text-2xl font-bold">{BRAND.name}</h1>
                <p className="text-white/70 text-sm">{BRAND.tagline}</p>
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Build Your Future with<br />Interactive Learning
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Master programming through hands-on exercises, AI-powered assistance, and real-world projects.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Tracks', value: '10+' },
                { label: 'Exercises', value: '100+' },
                { label: 'AI Powered', value: '24/7' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="login-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      name="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={clearAutofill}
                      readOnly
                      className="pl-10"
                      placeholder="you@college.edu"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      data-1p-ignore
                      data-lpignore="true"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="login-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      name="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={clearAutofill}
                      readOnly
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      autoComplete="new-password"
                      data-1p-ignore
                      data-lpignore="true"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
