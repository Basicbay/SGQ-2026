import 'reflect-metadata';
import dataSource from './data-source.js';

try {
  await dataSource.initialize();
  const migrations = await dataSource.runMigrations();
  console.log(`Applied ${migrations.length} migration(s).`);
} finally {
  if (dataSource.isInitialized) await dataSource.destroy();
}
