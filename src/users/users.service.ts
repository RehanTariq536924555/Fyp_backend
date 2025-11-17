import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { Buyer } from './entities/buyer.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<Buyer> {
    const { email } = createUserDto;
    console.log('UsersService: Attempting to create buyer with email:', email);
    const existingUser = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) throw new ConflictException('Email already exists');
    const user = this.userRepository.create({ ...createUserDto, email: email.toLowerCase(), emailVerificationToken: uuidv4() });
    await this.userRepository.save(user);
    await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
    console.log('UsersService: Buyer created and email sent for:', user.email);
    return user;
  }

  async findAll(): Promise<Buyer[]> {
    console.log('UsersService: Fetching all buyers');
    return this.userRepository.find();
  }

  async findById(userId: number): Promise<Buyer | undefined> {
    console.log('UsersService: Finding buyer by ID:', userId);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findByEmail(email: string): Promise<Buyer | undefined> {
    const normalizedEmail = email.toLowerCase();
    console.log('UsersService: Finding buyer by email:', normalizedEmail);
    const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      console.log('UsersService: No buyer found - Raw query:', await this.userRepository.query('SELECT * FROM buyer WHERE email = $1', [normalizedEmail]));
    } else {
      console.log('UsersService: Buyer found:', user.email);
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<Buyer | null> {
    const normalizedEmail = email.toLowerCase();
    console.log('UsersService: Validating buyer with email:', normalizedEmail);
    const user = await this.findByEmail(normalizedEmail);
    if (!user) {
      console.log('UsersService: No buyer found for validation');
      return null;
    }
    // Temporarily disable email verification check for testing
    // if (!user.isEmailVerified) {
    //   console.log('UsersService: Email not verified for buyer:', normalizedEmail);
    //   throw new UnauthorizedException('Email not verified');
    // }
    console.log('UsersService: Comparing password with stored hash:', user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('UsersService: Password comparison result:', isMatch);
    return isMatch ? user : null;
  }

  async verifyEmail(token: string): Promise<Buyer | null> {
    const user = await this.userRepository.findOne({ where: { emailVerificationToken: token } });
    if (user) {
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await this.userRepository.save(user);
      console.log('UsersService: Email verified for:', user.email);
      return user;
    }
    return null;
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    console.log('UsersService: Updating password for user ID:', userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  async deleteUserById(userId: number): Promise<void> {
    console.log('UsersService: Deleting buyer with ID:', userId);
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`Buyer with ID ${userId} not found`);
    }
  }
}