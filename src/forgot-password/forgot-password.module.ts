import { Module } from '@nestjs/common';
import { ForgotPasswordService } from './forgot-password.service';
import { ForgotPasswordController } from './forgot-password.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';


@Module({
  imports: [
    UsersModule,
    // JwtModule.register({ secret: 'your-secret-key' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        // signOptions: {
        //   expiresIn: configService.get<string | number>('jwt.expirationTime'),
        // },
      }),
    }),
  ],
  providers: [ForgotPasswordService, EmailService],
  controllers: [ForgotPasswordController],
})
export class ForgotPasswordModule {}
