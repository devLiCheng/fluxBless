import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}
