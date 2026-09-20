import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ApiResponseInterceptor } from '../common/api-response.interceptor.js';
import {
  DashboardOverviewResponseDto,
  DashboardPeriod,
  DashboardQueryDto,
} from './dashboard.dto.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    operationId: 'getDashboardOverview',
    summary: 'ดึงข้อมูลสถิติภาพรวมและแนวโน้มใบเสนอราคาตามช่วงเวลา (Get dashboard overview stats & trends)',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: DashboardPeriod,
    description: 'ช่วงเวลาที่ต้องการดูสถิติ (TODAY, YESTERDAY, THIS_WEEK, LAST_7_DAYS, THIS_MONTH, THIS_QUARTER, THIS_YEAR) ค่าเริ่มต้น: TODAY',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงข้อมูลภาพรวมสำเร็จ',
    type: DashboardOverviewResponseDto,
  })
  async getOverview(@Query() query: DashboardQueryDto): Promise<DashboardOverviewResponseDto> {
    return this.dashboardService.getOverview(query.period);
  }
}
