import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import {BuyerLocalStrategy } from './strategies/buyer-local.strategy';

import {  BuyerJwtStrategy } from './strategies/buyer-jwt.strategy';

import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/users.repository';
import { EmailService } from 'src/email/email.service';


@Module({
  imports: [
    UsersModule,
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
  providers: [AuthService, BuyerLocalStrategy, BuyerJwtStrategy, UsersService, UserRepository, EmailService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
