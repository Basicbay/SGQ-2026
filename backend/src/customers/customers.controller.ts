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
import { ApiResponseInterceptor } from '../common/api-response.interceptor.js';
import {
  CreateCustomerDto,
  CustomerItemApiResponse,
  CustomerListApiResponse,
  CustomerQueryDto,
  DeleteCustomerApiResponse,
  UpdateCustomerDto,
} from './customer.dto.js';
import { CustomersService } from './customers.service.js';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({
    operationId: 'getCustomers',
    summary: 'ดึงรายการข้อมูลลูกค้าทั้งหมด พร้อมค้นหาและแบ่งหน้า (Get customer list)',
  })
  @ApiQuery({ name: 'search', required: false, description: 'คำค้นหา (รหัสลูกค้า, ชื่อลูกค้า/บริษัท, ชื่อผู้ติดต่อ, เลขผู้เสียภาษี, เบอร์โทร, email)' })
  @ApiQuery({ name: 'customerType', required: false, description: 'กรองตามประเภทลูกค้า (COMPANY, INDIVIDUAL)' })
  @ApiQuery({ name: 'status', required: false, description: 'กรองตามสถานะ (ACTIVE, INACTIVE)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'หน้าปัจจุบัน' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'จำนวนรายการต่อหน้า' })
  @ApiResponse({ status: 200, description: 'ดึงรายการข้อมูลลูกค้าสำเร็จ', type: CustomerListApiResponse })
  @ApiResponse({ status: 401, description: 'ไม่มีสิทธิ์เข้าถึง (Unauthorized)' })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getCustomerById',
    summary: 'ดึงข้อมูลลูกค้าตาม ID (Get customer by ID)',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลลูกค้าสำเร็จ', type: CustomerItemApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลลูกค้า (Not Found)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    operationId: 'createCustomer',
    summary: 'สร้างข้อมูลลูกค้าใหม่ (Create customer)',
  })
  @ApiResponse({ status: 201, description: 'สร้างข้อมูลลูกค้าสำเร็จ', type: CustomerItemApiResponse })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง (Validation error)' })
  @ApiResponse({ status: 409, description: 'รหัสลูกค้าซ้ำในระบบ (Conflict)' })
  create(@Body() input: CreateCustomerDto) {
    return this.customersService.create(input);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateCustomer',
    summary: 'แก้ไขข้อมูลลูกค้า (Update customer)',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'แก้ไขข้อมูลลูกค้าสำเร็จ', type: CustomerItemApiResponse })
  @ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง (Validation error)' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลลูกค้า (Not Found)' })
  @ApiResponse({ status: 409, description: 'รหัสลูกค้าซ้ำในระบบ (Conflict)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateCustomerDto) {
    return this.customersService.update(id, input);
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'deleteCustomer',
    summary: 'ลบข้อมูลลูกค้า (Delete customer)',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID' })
  @ApiResponse({ status: 200, description: 'ลบข้อมูลลูกค้าสำเร็จ', type: DeleteCustomerApiResponse })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลลูกค้า (Not Found)' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.delete(id);
  }
}
