import 'reflect-metadata';
import { hash } from 'argon2';
import { validateOrReject } from 'class-validator';
import { LoginDto } from '../auth/auth.dto.js';
import dataSource from './data-source.js';
import { User } from './user.entity.js';

const input = Object.assign(new LoginDto(), {
  username: process.env.CREATE_USER_USERNAME,
  password: process.env.CREATE_USER_PASSWORD,
});
try {
  await validateOrReject(input, { validationError: { target: false, value: false } });
  if (!process.env.DATABASE_URL) throw new Error('Missing database URL');
  await dataSource.initialize();
  await dataSource.getRepository(User).insert({ username: input.username, passwordHash: await hash(input.password) });
  console.log('User created.');
} catch {
  console.error('Could not create user. Check database/migrations, unique username (3–64 lowercase letters, digits, _, ., -), and password (12–128 characters).');
  process.exitCode = 1;
} finally {
  if (dataSource.isInitialized) await dataSource.destroy();
}
