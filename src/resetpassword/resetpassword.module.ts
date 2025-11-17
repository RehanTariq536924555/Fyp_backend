import { Module } from '@nestjs/common';
import { ResetPasswordService } from './resetpassword.service';
import { ResetPasswordsController } from './resetpassword.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [ResetPasswordService],
  controllers: [ResetPasswordsController],
})
export class ResetsModule {}