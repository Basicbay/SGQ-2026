import { getSystemSettings } from '@/lib/settings';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const settings = await getSystemSettings();
  return <LoginForm initialSettings={settings} />;
}
