import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSettings } from '../database/system-settings.entity.js';
import { User } from '../database/user.entity.js';
import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';
import { UserSettingsController } from './user-settings.controller.js';
import { UserSettingsService } from './user-settings.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([SystemSettings, User]), AuthModule],
  controllers: [SettingsController, UserSettingsController],
  providers: [SettingsService, UserSettingsService],
  exports: [SettingsService, UserSettingsService],
})
export class SettingsModule {}
