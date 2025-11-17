import { Controller, Post, Body, UseGuards, Request, Get, Param, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { Buyer } from '../users/entities/buyer.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<{ message: string; user?: Partial<Buyer> }> {
    console.log('AuthController: Register request received:', createUserDto);
    try {
      const user = await this.authService.register(createUserDto);
      return {
        message: 'User registered successfully. Please verify your email.',
        user: { id: user.id, email: user.email, name: user.name },
      };
    } catch (error) {
      console.error('AuthController: Registration error:', error);
      if (error instanceof ConflictException) {
        return { message: 'Email already exists. Please use a different email.' };
      }
      return { message: 'Registration failed. Please try again.' };
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<any> {
    console.log('AuthController: Login request received for:', (req.user as Buyer).email);
    try {
      const result = await this.authService.login(req.user as Buyer);
      console.log('AuthController: Login successful for user:', (req.user as Buyer).email);
      return result;
    } catch (error) {
      console.error('AuthController: Login error:', error);
      return { message: 'Invalid email or password' };
    }
  }

  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string): Promise<{ message: string; redirectUrl?: string }> {
    console.log('AuthController: Verify email request for token:', token);
    const user = await this.usersService.verifyEmail(token);
    if (user) {
      return {
        message: 'Email verified successfully',
        redirectUrl: `${process.env.FRONTEND_URL}/profile`,
      };
    }
    return { message: 'Invalid or expired verification token' };
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Get('protected-route')
  async getProtectedData() {
    return { data: 'This is protected data' };
  }
}