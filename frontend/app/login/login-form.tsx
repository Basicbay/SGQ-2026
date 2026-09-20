'use client';

/* eslint-disable @next/next/no-img-element */
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import type { SystemSettingsData } from '@/lib/settings-types';
import { useTopLoader } from 'nextjs-toploader';

const loginSchema = z.object({
  username: z.string().trim().min(3, 'Username ต้องมีอย่างน้อย 3 ตัวอักษร').max(64),
  password: z.string().min(8, 'Password ต้องมีอย่างน้อย 8 ตัวอักษร').max(128),
});

type LoginValues = z.infer<typeof loginSchema>;
type LoginFeedback = { type: 'invalid' | 'system'; message: string } | null;

const REMEMBERED_LOGIN_KEY = 'sgq-remembered-login';

function readRememberedLogin(): LoginValues | null {
  try {
    const raw = localStorage.getItem(REMEMBERED_LOGIN_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('username' in value) || !('password' in value)) return null;
    if (typeof value.username !== 'string' || typeof value.password !== 'string') return null;
    return { username: value.username, password: value.password };
  } catch {
    return null;
  }
}

export function LoginForm({ initialSettings }: { initialSettings: SystemSettingsData }) {
  const [feedback, setFeedback] = useState<LoginFeedback>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [settings] = useState(initialSettings);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const loader = useTopLoader();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const isSubmitting = form.formState.isSubmitting || isRedirecting;

  useEffect(() => {
    const rememberedLogin = readRememberedLogin();
    if (!rememberedLogin) return;
    form.reset(rememberedLogin);
    const rememberMe = document.getElementById('remember-me');
    if (rememberMe instanceof HTMLInputElement) rememberMe.checked = true;
  }, [form]);

  async function submit(values: LoginValues) {
    setFeedback(null);
    loader.start();

    const rememberMe = document.getElementById('remember-me');
    const shouldRemember = rememberMe instanceof HTMLInputElement && rememberMe.checked;
    if (!shouldRemember) {
      localStorage.removeItem(REMEMBERED_LOGIN_KEY);
    }
    try {
      const result = await signIn('credentials', {
        ...values,
        redirect: false,
        redirectTo: '/home',
      });

      if (result.error) {
        loader.done();
        const invalidCredentials = result.code === 'credentials';
        setFeedback({
          type: invalidCredentials ? 'invalid' : 'system',
          message: invalidCredentials
            ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง '
            : 'เกิดข้อผิดพลาดของระบบ ไม่สามารถเชื่อมต่อ API ได้ ',
        });
        form.setFocus('password');
        return;
      }

      if (shouldRemember) {
        localStorage.setItem(REMEMBERED_LOGIN_KEY, JSON.stringify(values));
      }

      setIsRedirecting(true);
      window.location.replace('/home');
    } catch {
      loader.done();
      setFeedback({
        type: 'system',
        message: 'เกิดข้อผิดพลาดของระบบ ไม่สามารถเชื่อมต่อ API ได้ ',
      });
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-24 text-foreground transition-colors duration-300 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
        <span className="absolute left-1/2 top-[-18rem] size-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[110px] sm:size-[52rem]" />
        <span className="absolute -bottom-48 -left-40 size-96 rounded-full bg-primary/5 blur-[90px]" />
        <span className="absolute -bottom-56 -right-40 size-[30rem] rounded-full bg-muted/60 blur-[100px]" />
      </div>

      <header className="absolute left-5 top-5 z-10 flex items-center gap-3 sm:left-8 sm:top-8">
        <span className="grid size-11 place-items-center rounded-lg border border-border bg-card shadow-sm sm:size-12 overflow-hidden" aria-hidden="true">
          {settings.iconUrl ? (
            <img src={settings.iconUrl} alt={settings.siteName} className="size-full object-contain p-1.5" />
          ) : (
            <svg viewBox="0 0 48 48" className="size-7 text-primary" fill="none">
              <path d="M33.5 14.5c-2.2-2.1-5.4-3.4-9-3.4-6.2 0-10.8 3.2-10.8 7.9 0 5.2 4.7 6.4 10.4 7.5 4.2.8 6.2 1.5 6.2 3.8 0 2.2-2.3 3.8-6.1 3.8-4 0-7.4-1.6-9.8-4.1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M24 6v5M24 35v7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-base font-semibold tracking-[-0.01em] sm:text-lg">{settings.siteName}</p>
          <p className="text-xs text-muted-foreground">{settings.siteDescription}</p>
        </div>
      </header>

      <div className="absolute right-5 top-5 z-10 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <section className="relative z-[1] w-full max-w-[30rem] rounded-2xl border border-border bg-card/95 p-6 text-card-foreground shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9" aria-labelledby="login-title">
        <div className="mb-7 text-center">
          <h1 id="login-title" className="text-2xl font-semibold tracking-[-0.01em]">เข้าสู่ระบบ</h1>
          <p className="mt-2 text-base leading-6 text-muted-foreground">กรุณากรอกข้อมูลเพื่อเข้าใช้งานระบบ</p>
        </div>

        <form onSubmit={form.handleSubmit(submit)} className="space-y-6" noValidate>
            <div className="flex flex-col gap-2.5">
              <label htmlFor="username" className="text-sm font-medium tracking-[-0.01em]">ชื่อผู้ใช้</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4.5 20c.7-4.2 3.2-6.3 7.5-6.3s6.8 2.1 7.5 6.3" strokeLinecap="round" />
                </svg>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="กรอกชื่อผู้ใช้"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.username)}
                  aria-describedby={form.formState.errors.username ? 'username-error' : undefined}
                  className="h-12 rounded-lg bg-muted/60 pl-12 pr-4 text-base"
                  {...form.register('username')}
                />
              </div>
              {form.formState.errors.username ? <p id="username-error" className="text-sm text-[#b42318]">{form.formState.errors.username.message}</p> : null}
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="password" className="text-sm font-medium tracking-[-0.01em]">รหัสผ่าน</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="2.5" />
                  <path d="M8 10V7.5a4 4 0 0 1 8 0V10M12 14v2" strokeLinecap="round" />
                </svg>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="กรอกรหัสผ่าน"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.password)}
                  aria-describedby={form.formState.errors.password ? 'password-error' : undefined}
                  className="h-12 rounded-lg bg-muted/60 pl-12 pr-16 text-base"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
                </button>
              </div>
              {form.formState.errors.password ? <p id="password-error" className="text-sm text-[#b42318]">{form.formState.errors.password.message}</p> : null}
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground">
              <input
                id="remember-me"
                type="checkbox"
                disabled={isSubmitting}
                className="size-4 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span>จดจำฉันในอุปกรณ์นี้</span>
            </label>

            {feedback ? (
              <div
                role="alert"
                aria-live="assertive"
                className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-sm leading-5 text-destructive"
              >
                <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <p>{feedback.message}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-lg text-base tracking-[-0.01em] shadow-sm active:scale-[0.98] motion-reduce:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2.5">
                  <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                  กำลังตรวจสอบ...
                </span>
              ) : 'เข้าสู่ระบบ'}
            </Button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">หากไม่สามารถเข้าสู่ระบบได้ โปรดติดต่อผู้ดูแลระบบ</p>
      </section>
    </main>
  );
}
