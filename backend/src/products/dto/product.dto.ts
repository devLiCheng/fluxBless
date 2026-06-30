import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  nameZh: string;

  @IsString()
  nameEn: string;

  @IsString()
  descriptionZh: string;

  @IsString()
  descriptionEn: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock: number;

  @IsArray()
  images: string[];

  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  @IsOptional()
  @IsString()
  materialZh?: string;

  @IsOptional()
  @IsString()
  materialEn?: string;

  @IsOptional()
  @IsString()
  originZh?: string;

  @IsOptional()
  @IsString()
  originEn?: string;

  @IsOptional()
  @IsString()
  purificationZh?: string;

  @IsOptional()
  @IsString()
  purificationEn?: string;

  @IsOptional()
  @IsString()
  benefitsZh?: string;

  @IsOptional()
  @IsString()
  benefitsEn?: string;

  @IsOptional()
  @IsString()
  specWeight?: string;

  @IsOptional()
  @IsString()
  specBeadSize?: string;

  @IsOptional()
  @IsString()
  specBeadCount?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ratingOverride?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salesOverride?: number;

  @IsOptional()
  @IsString()
  specWristSizeZh?: string;

  @IsOptional()
  @IsString()
  specWristSizeEn?: string;

  @IsOptional()
  @IsString()
  sizingDescZh?: string;

  @IsOptional()
  @IsString()
  sizingDescEn?: string;

  @IsOptional()
  @IsString()
  purchaseUrl?: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  nameZh?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  descriptionZh?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString()
  materialZh?: string;

  @IsOptional()
  @IsString()
  materialEn?: string;

  @IsOptional()
  @IsString()
  originZh?: string;

  @IsOptional()
  @IsString()
  originEn?: string;

  @IsOptional()
  @IsString()
  purificationZh?: string;

  @IsOptional()
  @IsString()
  purificationEn?: string;

  @IsOptional()
  @IsString()
  benefitsZh?: string;

  @IsOptional()
  @IsString()
  benefitsEn?: string;

  @IsOptional()
  @IsString()
  specWeight?: string;

  @IsOptional()
  @IsString()
  specBeadSize?: string;

  @IsOptional()
  @IsString()
  specBeadCount?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ratingOverride?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salesOverride?: number;

  @IsOptional()
  @IsString()
  specWristSizeZh?: string;

  @IsOptional()
  @IsString()
  specWristSizeEn?: string;

  @IsOptional()
  @IsString()
  sizingDescZh?: string;

  @IsOptional()
  @IsString()
  sizingDescEn?: string;

  @IsOptional()
  @IsString()
  purchaseUrl?: string;
}

export class ProductQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  isAdmin?: string;
}

