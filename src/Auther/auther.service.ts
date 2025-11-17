import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
// import { User } from '../users/entities/user.entity';
import { SellerService } from 'src/Seller/seller.service';
import { Seller } from 'src/Seller/entities/seller.entity'
@Injectable()
export class AutherService {
  constructor(
    private readonly SellerService: SellerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise< Seller> {
    return this.SellerService.createUser(createUserDto);
  }

  async validateUser(email: string, password: string): Promise< Seller | null> {
    return this.SellerService.validateUser(email, password);
  }

  async login(user:  Seller) {
    const payload = {id: user.id, email: user.email};
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name },  
    };
  }
}
