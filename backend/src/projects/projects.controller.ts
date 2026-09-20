import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponseInterceptor } from '../common/api-response.interceptor.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import {
  CreateProjectDto,
  DeleteProjectApiResponse,
  ProjectItemApiResponse,
  ProjectListApiResponse,
  ProjectQueryDto,
  UpdateProjectDto,
} from './project.dto.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getProjects',
    summary: 'ดึงรายการข้อมูลโครงการทั้งหมด (ค้นหา, กรองประเภท/สถานะ/ลูกค้า, แบ่งหน้า)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงรายการโครงการสำเร็จ',
    type: ProjectListApiResponse,
  })
  async findAll(@Query() query: ProjectQueryDto) {
    return this.projectsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getProjectById',
    summary: 'ดึงข้อมูลโครงการรายโครงการตาม ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID ของโครงการ',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'พบข้อมูลโครงการ',
    type: ProjectItemApiResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลโครงการตาม ID ที่ระบุ',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createProject',
    summary: 'สร้างข้อมูลโครงการใหม่',
    description: 'หากไม่ระบุรหัสโครงการ ระบบจะสร้างให้อัตโนมัติตามลำดับ เช่น PRJ-2026-0006',
  })
  @ApiResponse({
    status: 201,
    description: 'สร้างข้อมูลโครงการสำเร็จ',
    type: ProjectItemApiResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลโครงการไม่ถูกต้องหรือไม่ครบถ้วน',
  })
  @ApiResponse({
    status: 409,
    description: 'รหัสโครงการซ้ำกับที่มีอยู่ในระบบ',
  })
  async create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateProject',
    summary: 'แก้ไขข้อมูลโครงการ',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID ของโครงการ',
  })
  @ApiResponse({
    status: 200,
    description: 'แก้ไขข้อมูลโครงการสำเร็จ',
    type: ProjectItemApiResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลโครงการตาม ID ที่ระบุ',
  })
  @ApiResponse({
    status: 409,
    description: 'รหัสโครงการซ้ำกับโครงการอื่นในระบบ',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'deleteProject',
    summary: 'ลบข้อมูลโครงการออกจากระบบ',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID ของโครงการที่ต้องการลบ',
  })
  @ApiResponse({
    status: 200,
    description: 'ลบข้อมูลโครงการสำเร็จ',
    type: DeleteProjectApiResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลโครงการตาม ID ที่ระบุ',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }
}
