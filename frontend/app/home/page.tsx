import { Suspense } from 'react';
import { auth } from '@/auth';
import { getSystemSettings } from '@/lib/settings';
import { DashboardContent } from './dashboard-content';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, session] = await Promise.all([
    getSystemSettings(),
    auth(),
  ]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DashboardContent
        initialSettings={settings}
        initialUser={session?.user ? { id: session.user.id, name: session.user.name, email: session.user.email } : null}
      />
    </Suspense>
  );
}
