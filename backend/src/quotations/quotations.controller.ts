import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
  ChangeQuotationStatusDto,
  CreateQuotationDto,
  DeleteQuotationApiResponse,
  QuotationDetailApiResponse,
  QuotationListApiResponse,
  QuotationQueryDto,
  UpdateQuotationDto,
} from './quotation.dto.js';
import { QuotationsService } from './quotations.service.js';

@ApiTags('quotations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getQuotations',
    summary: 'ดึงรายการใบเสนอราคา พร้อมค้นหา กรองสถานะ และแบ่งหน้า (Get quotations list)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'คำค้นหา (เลขที่ใบเสนอราคา, ชื่อลูกค้า, ชื่อโครงการ)' })
  @ApiQuery({ name: 'status', required: false, description: 'กรองตามสถานะใบเสนอราคา' })
  @ApiQuery({ name: 'customerId', required: false, description: 'กรองตามรหัสลูกค้า (Customer UUID)' })
  @ApiQuery({ name: 'projectId', required: false, description: 'กรองตามรหัสโครงการ (Project UUID)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'ตั้งแต่วันที่ (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ถึงวันที่ (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'หน้าปัจจุบัน' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'จำนวนรายการต่อหน้า' })
  @ApiResponse({ status: 200, description: 'ดึงรายการใบเสนอราคาสำเร็จ', type: QuotationListApiResponse })
  findAll(@Query() query: QuotationQueryDto) {
    return this.quotationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getQuotationById',
    summary: 'ดึงรายละเอียดใบเสนอราคาและรายการสินค้า (Get quotation details by ID)',
  })
  @ApiParam({ name: 'id', description: 'รหัสใบเสนอราคา (UUID)' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลใบเสนอราคาสำเร็จ', type: QuotationDetailApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลใบเสนอราคา' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createQuotation',
    summary: 'สร้างใบเสนอราคาใหม่ (Create a new quotation)',
  })
  @ApiResponse({ status: 201, description: 'สร้างใบเสนอราคาสำเร็จ', type: QuotationDetailApiResponse })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้องตามเงื่อนไข' })
  create(@Body() dto: CreateQuotationDto, @Req() req: AuthenticatedRequest) {
    return this.quotationsService.create(dto, { id: req.userId, role: '' });
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateQuotation',
    summary: 'แก้ไขข้อมูลใบเสนอราคาและรายการสินค้า (Update quotation and line items)',
  })
  @ApiParam({ name: 'id', description: 'รหัสใบเสนอราคา (UUID)' })
  @ApiResponse({ status: 200, description: 'แก้ไขใบเสนอราคาสำเร็จ', type: QuotationDetailApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลใบเสนอราคา' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.quotationsService.update(id, dto, { id: req.userId, role: '' });
  }

  @Patch(':id/status')
  @ApiOperation({
    operationId: 'changeQuotationStatus',
    summary: 'เปลี่ยนสถานะใบเสนอราคา เช่น อนุมัติ ส่งมอบ ปฏิเสธ (Change quotation status)',
  })
  @ApiParam({ name: 'id', description: 'รหัสใบเสนอราคา (UUID)' })
  @ApiResponse({ status: 200, description: 'เปลี่ยนสถานะใบเสนอราคาสำเร็จ', type: QuotationDetailApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลใบเสนอราคา' })
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeQuotationStatusDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.quotationsService.changeStatus(id, dto, { id: req.userId, role: '' });
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'deleteQuotation',
    summary: 'ลบใบเสนอราคา (Delete quotation)',
  })
  @ApiParam({ name: 'id', description: 'รหัสใบเสนอราคา (UUID)' })
  @ApiResponse({ status: 200, description: 'ลบใบเสนอราคาสำเร็จ', type: DeleteQuotationApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลใบเสนอราคา' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: AuthenticatedRequest) {
    return this.quotationsService.remove(id, { id: req.userId, role: '' });
  }
}
