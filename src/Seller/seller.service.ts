import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SellerRepository } from './seller.repository';
import { Seller } from './entities/seller.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../email/email.service';
import { createSellerDto } from './dto/CreateUser.dto';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(SellerRepository)
    private readonly sellerRepository: SellerRepository,
    private readonly emailService: EmailService,
  ) {}

  async createUser(createSellerDto: createSellerDto):Promise<Seller> {
    const user = this.sellerRepository.create(createSellerDto);
    user.emailVerificationToken = uuidv4();
    user.password = await bcrypt.hash(createSellerDto.password, 10);
    await this.sellerRepository.save(user);
    await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
    return user;
  }

  findAll(): Promise<Seller[]> {
    return this.sellerRepository.find({
      relations: ['profile', 'listings'],
    });
  }

  async findById(userId: number): Promise<Seller | undefined> {
    return this.sellerRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'listings'],
    });
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.sellerRepository.update(userId, { password: hashedPassword });
  }

  async deleteUserById(userId: number): Promise<void> {
    const result = await this.sellerRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  async findByEmail(email: string): Promise<Seller | undefined> {
    return this.sellerRepository.findByEmail(email);
  }

  async validateUser(email: string, password: string): Promise<Seller | null> {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async verifyEmail(token: string): Promise<Seller | null> {
    const user = await this.sellerRepository.findOne({ where: { emailVerificationToken: token } });
    if (user) {
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await this.sellerRepository.save(user);
      return user;
    }
    return null;
  }

  // Profile Logic
  async createProfile(userId: number, profileData: any) {
    const seller = await this.sellerRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!seller) throw new BadRequestException('Seller not found');
    if (seller.profile) throw new BadRequestException('Profile already exists');

    seller.profile = profileData;
    return this.sellerRepository.save(seller);
  }

  async getProfile(userId: number) {
    const seller = await this.sellerRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!seller?.profile) throw new NotFoundException('Profile not found');
    return seller.profile;
  }

  async updateProfile(userId: number, profileData: any) {
    const seller = await this.sellerRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!seller?.profile) throw new NotFoundException('Profile not found');

    Object.assign(seller.profile, profileData);
    return this.sellerRepository.save(seller);
  }

  async deleteProfile(userId: number) {
    const seller = await this.sellerRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!seller?.profile) throw new NotFoundException('Profile not found');

    seller.profile = null;
    await this.sellerRepository.save(seller);
    return { message: 'Profile deleted successfully' };
  }
}
