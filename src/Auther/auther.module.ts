import { Module } from '@nestjs/common';
import { AutherService } from './auther.service';
import { UsersModule } from '../users/users.module';
import { SellerModule } from '../Seller/sellerModule.module'; // Import SellerModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AutherController } from './auther.controller';
import { SellerLocalStrategy } from './strategies/localseller.strategy';
import { SellerJwtStrategy} from './strategies/jwtseller.strategy';

@Module({
  imports: [
    UsersModule,
    SellerModule, // Add SellerModule to provide SellerService and SellerRepository
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string | number>('jwt.expirationTime'),
        },
      }),
    }),
  ],
  providers: [
    AutherService,
    SellerLocalStrategy,
SellerJwtStrategy,
    // Remove UsersService, UserRepository, EmailService, and SellerService from providers
    // as they are likely provided by UsersModule and SellerModule
  ],
  controllers: [AutherController],
  exports: [AutherService],
})
export class AutherModule {}