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
  CreateProductDto,
  DeleteProductApiResponse,
  ProductItemApiResponse,
  ProductListApiResponse,
  ProductQueryDto,
  UpdateProductDto,
} from './product.dto.js';
import { ProductsService } from './products.service.js';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ApiResponseInterceptor)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    operationId: 'getProducts',
    summary: 'ดึงรายการข้อมูลสินค้าและวัสดุทั้งหมด (ค้นหา, กรองหมวดหมู่/แบรนด์/สต็อก/สถานะ, แบ่งหน้า)',
  })
  @ApiResponse({
    status: 200,
    description: 'ดึงรายการสินค้าและวัสดุสำเร็จ',
    type: ProductListApiResponse,
  })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    operationId: 'getProductById',
    summary: 'ดึงข้อมูลสินค้าและวัสดุรายชิ้นตาม ID',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID ของสินค้า/วัสดุ',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'พบข้อมูลสินค้าและวัสดุ',
    type: ProductItemApiResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลสินค้าและวัสดุตาม ID ที่ระบุ',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    operationId: 'createProduct',
    summary: 'สร้างข้อมูลสินค้าและวัสดุใหม่',
    description: 'หากไม่ระบุรหัสสินค้า ระบบจะสร้างให้อัตโนมัติตามลำดับ เช่น PRD-2026-0001',
  })
  @ApiResponse({
    status: 201,
    description: 'สร้างข้อมูลสินค้าและวัสดุสำเร็จ',
    type: ProductItemApiResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'ข้อมูลสินค้าและวัสดุไม่ถูกต้องหรือไม่ครบถ้วน',
  })
  @ApiResponse({
    status: 409,
    description: 'รหัสสินค้าซ้ำกับที่มีอยู่ในระบบ',
  })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({
    operationId: 'updateProduct',
    summary: 'แก้ไขข้อมูลสินค้าและวัสดุ',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID ของสินค้า/วัสดุ',
  })
  @ApiResponse({
    status: 200,
    description: 'แก้ไขข้อมูลสินค้าและวัสดุสำเร็จ',
    type: ProductItemApiResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลสินค้าและวัสดุตาม ID ที่ระบุ',
  })
  @ApiResponse({
    status: 409,
    description: 'รหัสสินค้าซ้ำกับสินค้าอื่นในระบบ',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    operationId: 'deleteProduct',
    summary: 'ลบข้อมูลสินค้าและวัสดุออกจากระบบ',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'UUID ของสินค้า/วัสดุที่ต้องการลบ',
  })
  @ApiResponse({
    status: 200,
    description: 'ลบข้อมูลสินค้าและวัสดุสำเร็จ',
    type: DeleteProductApiResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'ไม่พบข้อมูลสินค้าและวัสดุตาม ID ที่ระบุ',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
