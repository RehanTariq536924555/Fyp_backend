import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SellerService } from '../seller/seller.service';
import { EmailVerificationService } from '../emailVerification/emailverification.service'; // Adjust to EmailVerificationService if needed

@Injectable()
export class ForgotPasswordsService {
  constructor(
    private readonly sellerService: SellerService, // Correctly inject SellerService
    private readonly jwtService: JwtService,
    private readonly emailService: EmailVerificationService, // Use EmailService or EmailVerificationService
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.sellerService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = this.jwtService.sign({ userId: user.id }, { expiresIn: '1h' });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(email, user.name, resetUrl);
  }
}