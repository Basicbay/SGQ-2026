import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'node:path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { databaseOptions } from './database/data-source.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnvironment } from './config.js';
import { SettingsModule } from './settings/settings.module.js';
import { UploadModule } from './upload/upload.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ProductsModule } from './products/products.module.js';
import { QuotationsModule } from './quotations/quotations.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env.local'),
        resolve(process.cwd(), '..', '.env.local'),
        '.env',
      ],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.getOrThrow<string>('DATABASE_URL');
        const database = new URL(databaseUrl);
        const useSsl = database.searchParams.get('sslmode') === 'require' || database.hostname.endsWith('.neon.tech');
        return {
          ...databaseOptions,
          url: databaseUrl,
          ssl: useSsl ? { rejectUnauthorized: false } : undefined,
        };
      },
    }),
    AuthModule,
    SettingsModule,
    UploadModule,
    CustomersModule,
    ProjectsModule,
    ProductsModule,
    QuotationsModule,
    DashboardModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? '',
      appSecret: process.env.OBSERVE_APP_SECRET ?? '',
      runtimeMetrics: !Boolean(process.versions?.['webcontainer']),
      serviceId: 'nest-typescript-starter',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
