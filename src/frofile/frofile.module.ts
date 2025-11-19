import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileService } from './frofile.service';
import { Profile } from './entities/frofile.entity';
import { ProfileController } from './frofile.controller';
import { Seller } from '../Seller/entities/seller.entity';
import { SellerModule } from '../Seller/sellerModule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Seller]), // ✅ Added Seller entity here
    SellerModule
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfilesModule {}
