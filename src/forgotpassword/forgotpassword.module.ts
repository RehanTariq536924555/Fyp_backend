import { Module } from '@nestjs/common';
import { ForgotPasswordsService } from './forgotpassword.service';
import { ForgotPasswordsController } from './forgotpassword.controller';
import { SellerModule } from '../Seller/sellerModule.module'; // Import SellerModule
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SellerModule, // Provides SellerService
  
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION', '1h') },
      }),
    }),
  ],
  providers: [ForgotPasswordsService],
  controllers: [ForgotPasswordsController],
})
export class ForgotPasswordsModule {} // Renamed to ForgotPasswordModule for clarity