import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AutherService } from '../auther.service';

// seller/local.strategy.ts
@Injectable()
export class SellerLocalStrategy extends PassportStrategy(Strategy, 'seller-local') {
  constructor(private readonly authService: AutherService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }
}
