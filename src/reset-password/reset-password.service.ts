import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { newPassword, confirmPassword } = resetPasswordDto;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Verify JWT token and extract userId
    let decoded: { userId: number };
    try {
      decoded = this.jwtService.verify(token) as { userId: number };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
    const userId = decoded.userId;

    // Find user by ID
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update password
    await this.usersService.updatePassword(userId, newPassword);

    return { message: 'Password reset successfully' };
  }
}