import { IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBlogPostDto {
  @IsString()
  titleZh: string;

  @IsString()
  titleEn: string;

  @IsString()
  slug: string;

  @IsString()
  summaryZh: string;

  @IsString()
  summaryEn: string;

  @IsString()
  contentZh: string;

  @IsString()
  contentEn: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readTime?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  titleZh?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  summaryZh?: string;

  @IsOptional()
  @IsString()
  summaryEn?: string;

  @IsOptional()
  @IsString()
  contentZh?: string;

  @IsOptional()
  @IsString()
  contentEn?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readTime?: number;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class BlogPostQueryDto {
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
  limit?: number = 10;

  @IsOptional()
  @IsString()
  isAdmin?: string;
}
