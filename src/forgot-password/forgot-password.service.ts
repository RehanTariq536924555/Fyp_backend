import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';


@Injectable()
export class ForgotPasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService, 
  ) {}

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const token = this.jwtService.sign({ userId: user.id }, { expiresIn: '1h' });


    const resetUrl = `${process.env.FRONTEND_URL}/reset?token=${token}`;

    await this.emailService.sendPasswordResetEmail(email, user.name, resetUrl);


  }
}
