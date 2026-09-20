import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      fullName: string;
      nickname: string | null;
      phone: string | null;
      citizenId: string | null;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username?: string;
    role?: string;
    fullName?: string;
    nickname?: string | null;
    phone?: string | null;
    citizenId?: string | null;
  }
}
