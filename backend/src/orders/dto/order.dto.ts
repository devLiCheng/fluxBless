import { IsString, IsArray, IsNumber, ValidateNested, Min, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  shippingAddress: string;

  @IsString()
  contactPhone: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  paymentMethod: string; // "stripe"
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string; // "pending" | "paid" | "shipped" | "completed" | "cancelled"
}
