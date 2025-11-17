import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerRepository } from './seller.repository';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { EmailService } from '../email/email.service';
import { Seller } from './entities/seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, SellerRepository])],
  controllers: [SellerController],
  providers: [SellerService, SellerRepository, EmailService],
  exports: [SellerService, TypeOrmModule],
})
export class SellerModule {}
