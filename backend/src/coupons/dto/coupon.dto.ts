import { IsString, IsNumber, IsBoolean, IsDateString, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discountAmount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @IsDateString()
  expiresAt: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discountAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minOrderAmount?: number;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ClaimCouponDto {
  @IsString()
  code: string;
}
