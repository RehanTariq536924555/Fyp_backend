import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/order.entity';
import { Buyer } from '../users/entities/buyer.entity';
import { Seller } from '../Seller/entities/seller.entity';
import { Listing } from '../listings/entities/listing.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Buyer, Seller, Listing]), AuthModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}