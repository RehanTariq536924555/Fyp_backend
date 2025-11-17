
import { IsString, IsNumber, IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(['bank-transfer', 'cash', 'stripe'])
  paymentMethod: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsArray()
  @IsNotEmpty()
  items: { id: string; title: string; price: number }[];

  @IsOptional()
  paymentDetails?: { bankName?: string; accountNumber?: string };

 

  @IsString()
  @IsOptional()
  seller?: string;

  @IsNumber()
  @IsOptional()
  buyerId?: number;
}
