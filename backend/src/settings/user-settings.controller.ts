import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/jwt-auth.guard.js';
import { ApiResponseInterceptor } from '../common/api-response.interceptor.js';
import {
  CreateUserDto,
  DeleteUserApiResponse,
  UpdateUserDto,
  UserItemApiResponse,
  UserListApiResponse,
  UserQueryDto,
} from './user.dto.js';
import { UserSettingsService } from './user-settings.service.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
@Controller('settings/users')
export class UserSettingsController {
  constructor(private readonly service: UserSettingsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getUsersSettings',
    summary: 'ดึงรายการข้อมูลผู้ใช้งานทั้งหมด พร้อมค้นหาและแบ่งหน้า (Get user list)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'คำค้นหา (ชื่อ, ชื่อเล่น, email, เบอร์โทร, เลขบัตรประชาชน, username)' })
  @ApiQuery({ name: 'role', required: false, description: 'กรองตามบทบาทผู้ใช้ (SUPER_ADMIN, ADMIN, SALES, ESTIMATOR)' })
  @ApiQuery({ name: 'status', required: false, description: 'กรองตามสถานะผู้ใช้ (ACTIVE, INACTIVE)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'หน้าปัจจุบัน' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'จำนวนรายการต่อหน้า' })
  @ApiResponse({ status: 200, description: 'ดึงรายการข้อมูลผู้ใช้งานสำเร็จ', type: UserListApiResponse })
  @ApiResponse({ status: 401, description: 'ไม่มีสิทธิ์เข้าถึง (Unauthorized)' })
  findAll(@Query() query: UserQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getUserSettingsById',
    summary: 'ดึงข้อมูลผู้ใช้งานตาม ID (Get user by ID)',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลผู้ใช้งานสำเร็จ', type: UserItemApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้งาน (Not Found)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createUserSettings',
    summary: 'สร้างผู้ใช้งานใหม่ (Create user)',
  })
  @ApiResponse({ status: 201, description: 'สร้างผู้ใช้งานสำเร็จ', type: UserItemApiResponse })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง (Validation error)' })
  @ApiResponse({ status: 409, description: 'ชื่อผู้ใช้งานซ้ำในระบบ (Conflict)' })
  create(@Body() input: CreateUserDto) {
    return this.service.create(input);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateUserSettings',
    summary: 'แก้ไขข้อมูลผู้ใช้งาน (Update user)',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'แก้ไขข้อมูลผู้ใช้งานสำเร็จ', type: UserItemApiResponse })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง (Validation error)' })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้งาน (Not Found)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateUserDto) {
    return this.service.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'deleteUserSettings',
    summary: 'ลบผู้ใช้งาน (Delete user)',
  })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'ลบผู้ใช้งานสำเร็จ', type: DeleteUserApiResponse })
  @ApiResponse({ status: 400, description: 'ไม่สามารถลบบัญชีตนเองได้ (Bad Request)' })
  @ApiResponse({ status: 404, description: 'ไม่พบผู้ใช้งาน (Not Found)' })
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.service.delete(id, req.userId);
  }
}
