import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { UsersService } from './users.service';
import { Buyer } from './entities/buyer.entity'; // Updated import path
import { UsersController } from './users.controller';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Buyer])],
  providers: [UsersService, UserRepository, EmailService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}