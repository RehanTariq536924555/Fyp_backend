import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { ResetPasswordService } from './resetpassword.service';
import { ResetPasswordsDto } from './dto/resetpassword.dto';

@Controller('auth')
export class ResetPasswordsController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body() resetPasswordDto: ResetPasswordsDto,
  ) {
    console.log('Received token in controller:', token); // Add logging for debugging
    if (!token) {
      throw new BadRequestException('Token is required');
    }
    return this.resetPasswordService.resetPassword(token, resetPasswordDto);
  }
}