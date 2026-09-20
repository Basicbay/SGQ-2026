import { Body, Controller, Get, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseInterceptor } from '../common/api-response.interceptor.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SettingsService } from './settings.service.js';
import { UpdateSettingsDto } from './settings.dto.js';

@ApiTags('settings')
@UseInterceptors(ApiResponseInterceptor)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get('system')
  @ApiOperation({ operationId: 'getSystemSettings', summary: 'Get public system settings' })
  get() {
    return this.service.get();
  }

  @Get('storage')
  @ApiOperation({ operationId: 'getStorageStats', summary: 'Get Neon DB storage consumption and quota' })
  getStorage() {
    return this.service.getStorageStats();
  }

  @Put('system')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ operationId: 'updateSystemSettings', summary: 'Update company and website settings' })
  update(@Body() input: UpdateSettingsDto) {
    return this.service.update(input);
  }
}
