import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { ListingsModule } from './listings/listings.module';
import { ProfilesModule } from './frofile/frofile.module';

import { AutherModule } from './Auther/auther.module';
import { SellerModule } from './Seller/sellerModule.module';
// import { ForgotPasswordsModule } from '../src/forgotpassword/forgotpassword.module';
import { ResetsModule } from './resetpassword/resetpassword.module';
import {ForgotPasswordModule} from './forgot-password/forgot-password.module'
import { PaymentModule } from './payment/payment.module';
import {ReviewModule} from './reviews/review.module'
import { OrderModule } from './order/order.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env', 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),
   
    AuthModule,
    UsersModule,
    ForgotPasswordModule,
    ResetPasswordModule,
    ListingsModule,
    ProfilesModule,

    ResetsModule,

// EmailVerificationService,
  //  Seller,
   SellerModule ,
   AutherModule,
   PaymentModule,
   OrderModule,
   ReviewModule,
   RecommendationsModule,
  //  ForgotPasswordsModule,
  ],
  providers: [],
})
export class AppModule {}
