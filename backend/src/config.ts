import { isURL } from 'class-validator';

export function validateEnvironment(env: Record<string, unknown>) {
  const databaseUrl = typeof env.DATABASE_URL === 'string'
    ? env.DATABASE_URL.trim().replace(/^(?:"|')|(?:"|')$/g, '')
    : env.DATABASE_URL;
  const secret = env.JWT_SECRET;
  const port = Number(env.PORT ?? 4000);
  if (typeof databaseUrl !== 'string' || !isURL(databaseUrl, { protocols: ['postgres', 'postgresql'], require_protocol: true, require_tld: false })) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  return { ...env, DATABASE_URL: databaseUrl, JWT_SECRET: secret, PORT: port };
}
