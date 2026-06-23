import { IsInt, IsString, IsOptional, Length } from 'class-validator';

export class CreateInquiryDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsString()
  @Length(1, 190)
  contactInfo: string;

  @IsString()
  @Length(1, 5000)
  message: string;

  @IsOptional()
  @IsInt()
  productId?: number;
}

export class UpdateInquiryStatusDto {
  @IsString()
  status: string;
}
