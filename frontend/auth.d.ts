import 'next-auth';
import 'next-auth/jwt';
import '@auth/core/types';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
  interface User {
    accessToken?: string;
    expiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    expiresAt?: number;
  }
}

declare module '@auth/core/types' {
  interface User {
    accessToken?: string;
    expiresAt?: number;
  }

  interface Session {
    accessToken?: string;
  }
}
