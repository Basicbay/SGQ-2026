import 'reflect-metadata';
import { writeFile } from 'node:fs/promises';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { createApiDocument } from './setup.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { SettingsController } from './settings/settings.controller.js';
import { SettingsService } from './settings/settings.service.js';
import { UserSettingsController } from './settings/user-settings.controller.js';
import { UserSettingsService } from './settings/user-settings.service.js';
import { UploadController } from './upload/upload.controller.js';
import { UploadService } from './upload/upload.service.js';

// Export controller metadata without connecting to a database.
const module = await Test.createTestingModule({
  controllers: [AppController, AuthController, SettingsController, UserSettingsController, UploadController],
  providers: [
    AppService,
    { provide: AuthService, useValue: {} },
    { provide: SettingsService, useValue: {} },
    { provide: UserSettingsService, useValue: {} },
    { provide: UploadService, useValue: {} },
  ],
}).overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true }).compile();
const app = module.createNestApplication();
try {
  await writeFile(new URL('../openapi.json', import.meta.url), JSON.stringify(createApiDocument(app), null, 2) + '\n');
} finally {
  await app.close();
}
