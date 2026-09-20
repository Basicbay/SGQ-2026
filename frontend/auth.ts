import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const apiUrl = process.env.BACKEND_URL ?? "http://localhost:4000";

function hasLoginToken(
  value: unknown,
): value is {
  id: string; name: string; username: string; role: string; fullName: string;
  nickname: string | null; phone: string | null; email: string | null;
  citizenId: string | null; accessToken: string; expiresAt?: number;
} {
  return Boolean(
    value &&
    typeof value === "object" &&
    "accessToken" in value &&
    typeof value.accessToken === "string",
  );
}

class AuthenticationUnavailable extends CredentialsSignin {
  code = "service_unavailable";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username =
          typeof credentials?.username === "string"
            ? credentials.username.trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!username || !password) return null;

        let response: Response;
        try {
          response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username, password }),
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
          });
        } catch {
          throw new AuthenticationUnavailable();
        }

        if (response.status === 401) return null;
        if (!response.ok) throw new AuthenticationUnavailable();

        let result: unknown;
        try {
          result = await response.json();
        } catch {
          throw new AuthenticationUnavailable();
        }
        if (!result || typeof result !== "object" || !("data" in result))
          throw new AuthenticationUnavailable();
        const login = result.data;
        if (
          !login ||
          typeof login !== "object" ||
          !("accessToken" in login) ||
          !("expiresAt" in login) ||
          !("user" in login)
        )
          throw new AuthenticationUnavailable();
        if (
          !login.user ||
          typeof login.user !== "object" ||
          !("id" in login.user) ||
          !("username" in login.user)
        )
          throw new AuthenticationUnavailable();
        if (
          typeof login.accessToken !== "string" ||
          typeof login.user.id !== "string" ||
          typeof login.user.username !== "string"
        )
          throw new AuthenticationUnavailable();
        const fullName =
          "fullName" in login.user && typeof login.user.fullName === "string"
            ? login.user.fullName.trim()
            : "";
        return {
          id: login.user.id,
          username: login.user.username,
          role: 'role' in login.user && typeof login.user.role === 'string' ? login.user.role : '',
          fullName,
          nickname: 'nickname' in login.user && typeof login.user.nickname === 'string' ? login.user.nickname : null,
          phone: 'phone' in login.user && typeof login.user.phone === 'string' ? login.user.phone : null,
          email: 'email' in login.user && typeof login.user.email === 'string' ? login.user.email : null,
          citizenId: 'citizenId' in login.user && typeof login.user.citizenId === 'string' ? login.user.citizenId : null,
          name: fullName || login.user.username,
          accessToken: login.accessToken,
          expiresAt:
            typeof login.expiresAt === "number" ? login.expiresAt : undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (hasLoginToken(user)) {
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
        // Keep the display name from the login response (fullName) in the
        // persisted JWT instead of falling back to the username.
        token.name = user.name;
        token.username = user.username;
        token.role = user.role;
        token.fullName = user.fullName;
        token.nickname = user.nickname;
        token.phone = user.phone;
        token.email = user.email;
        token.citizenId = user.citizenId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user) {
        session.user.username = typeof token.username === 'string' ? token.username : '';
        session.user.role = typeof token.role === 'string' ? token.role : '';
        session.user.fullName = typeof token.fullName === 'string' ? token.fullName : (session.user.name ?? '');
        session.user.name = session.user.fullName;
        session.user.nickname = typeof token.nickname === 'string' ? token.nickname : null;
        session.user.phone = typeof token.phone === 'string' ? token.phone : null;
        session.user.email = typeof token.email === 'string' ? token.email : '';
        session.user.citizenId = typeof token.citizenId === 'string' ? token.citizenId : null;
      }
      return {
        ...session,
        accessToken:
          typeof token.accessToken === "string" ? token.accessToken : undefined,
      };
    },
  },
  pages: { signIn: "/login" },
});
