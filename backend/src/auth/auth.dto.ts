import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin', default: 'admin', minLength: 3, maxLength: 64, pattern: '^[a-z0-9_.-]+$' })
  @IsString()
  @Length(3, 64)
  @Matches(/^[a-z0-9_.-]+$/)
  username!: string;

  @ApiProperty({ format: 'password', example: 'SgqAdmin!2026Neon#7', default: 'SgqAdmin!2026Neon#7', minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  password!: string;
}

export class UserResponse {
  @ApiProperty({ format: 'uuid' })
  id!: string;
  @ApiProperty()
  username!: string;
  @ApiProperty({ example: 'ADMIN' })
  role!: string;
  @ApiProperty({ example: 'ACTIVE', required: false })
  status?: string;
  @ApiProperty({ required: false, nullable: true })
  fullName?: string | null;
  @ApiProperty({ required: false, nullable: true })
  nickname?: string | null;
  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;
  @ApiProperty({ required: false, nullable: true })
  email?: string | null;
  @ApiProperty({ required: false, nullable: true })
  citizenId?: string | null;
}

export class LoginResponse {
  @ApiProperty()
  accessToken!: string;
  @ApiProperty({ description: 'Unix timestamp in seconds' })
  expiresAt!: number;
  @ApiProperty({ type: () => UserResponse })
  user!: UserResponse;
}

export class ApiResponseEnvelope {
  @ApiProperty({ example: 200 })
  statusCode!: number;
  @ApiProperty({ type: String, nullable: true, example: null })
  error!: string | null;
  @ApiProperty({ example: '' })
  message_code!: string;
  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }] })
  message!: string | string[];
  @ApiProperty({ type: 'object', additionalProperties: true, example: {} })
  metadata!: Record<string, unknown>;
}

export class ApiError extends ApiResponseEnvelope {
  @ApiProperty({ type: 'object', additionalProperties: true, nullable: true, example: null })
  data!: null;
}

export class LoginApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => LoginResponse })
  data!: LoginResponse;
}

export class UserApiResponse extends ApiResponseEnvelope {
  @ApiProperty({ type: () => UserResponse })
  data!: UserResponse;
}
