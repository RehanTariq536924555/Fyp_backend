import { Controller, Post, Body, UseGuards, Request, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { AutherService } from './auther.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { SellerService } from '../Seller/seller.service';
import { EmailGuard } from './guards/email.guard';
import { JwtGuard } from './guards/jwt.guard';
import { SellerDto } from './dto/login.dto';

@Controller('auther')
export class AutherController {
  constructor(
    private readonly authService: AutherService,
    private readonly usersService: SellerService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards()
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    const user = await this.usersService.verifyEmail(token);
    if (user) {
      return { 
        message: 'Email verified successfully',
        redirectUrl: `${process.env.FRONTEND_URL}/profile`,
      };
    } else {
      return { message: 'Invalid or expired verification token' };
    }
  }

  @UseGuards(JwtGuard, EmailGuard)
  @Get('protected-route')
  async getProtectedData() {
    return { data: 'This is protected data' };
  }

  @UseGuards(JwtGuard, EmailGuard)
  @Get('Seller')
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
@Get('verify-token')
async verifyToken(@Request() req) {
  return { message: 'Token is valid', user: req.user }; // Return user info or any other relevant data
}

}