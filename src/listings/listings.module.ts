import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing } from './entities/listing.entity';
import { Seller } from '../Seller/entities/seller.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, Seller])],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
