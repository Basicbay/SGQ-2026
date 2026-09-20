import { redirect } from 'next/navigation';

export default function UserSettingsPage() {
  redirect('/home?view=user-settings');
}
