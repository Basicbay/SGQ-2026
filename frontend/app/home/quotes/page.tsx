import { redirect } from 'next/navigation';

export default function QuotesPage() {
  redirect('/home?view=quotes');
}
