import { Controller, Post, Body } from '@nestjs/common';
import { ForgotPasswordsService } from './forgotpassword.service';
import { ForgotPasswordsDto } from './dto/forgotpassword.dto';

@Controller('auther')
export class ForgotPasswordsController {
  constructor(private readonly forgotPasswordService: ForgotPasswordsService) {}

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordsDto) {
    return this.forgotPasswordService.forgotPassword(forgotPasswordDto.email);
  }
}