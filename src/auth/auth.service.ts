import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Buyer } from '../users/entities/buyer.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Buyer> {
    console.log('AuthService: Registering buyer with email:', createUserDto.email);
    return this.usersService.createUser(createUserDto);
  }

  async validateUser(email: string, password: string): Promise<Buyer | null> {
    console.log('AuthService: Validating buyer with email:', email);
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      console.log('AuthService: Validation failed for email:', email);
    } else {
      console.log('AuthService: Validation successful for email:', email);
    }
    return user;
  }

  async login(user: Buyer) {
    const payload = { email: user.email, sub: user.id };
    console.log('AuthService: Generating JWT for buyer:', user.email);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}