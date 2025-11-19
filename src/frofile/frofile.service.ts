import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/frofile.entity'; // Ensure the correct path
import { Seller } from '../Seller/entities/seller.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Seller) private sellerRepo: Repository<Seller>,
  ) {}

  async createProfile(sellerId: number, data: Partial<Profile>) {
    const seller = await this.sellerRepo.findOne({ where: { id: sellerId }, relations: ['profile'] });
    if (!seller) throw new BadRequestException('Seller not found');

    // Check if the seller already has a profile
    if (seller.profile) throw new BadRequestException('Profile already exists');

    const profile = this.profileRepo.create({ ...data, seller });
    return this.profileRepo.save(profile);
  }

  async getProfile(sellerId: number) {
    const seller = await this.sellerRepo.findOne({ where: { id: sellerId }, relations: ['profile'] });
    if (!seller) throw new BadRequestException('Seller not found');
    if (!seller.profile) throw new NotFoundException('Profile not found');
    return seller.profile;
  }

  async updateProfile(sellerId: number, data: Partial<Profile>) {
    const seller = await this.sellerRepo.findOne({ where: { id: sellerId }, relations: ['profile'] });
    if (!seller) throw new BadRequestException('Seller not found');
    if (!seller.profile) throw new NotFoundException('Profile not found');

    // Keep Seller.name in sync if name is updated in profile
    if (typeof data.name === 'string' && data.name.trim().length > 0) {
      seller.name = data.name.trim();
      await this.sellerRepo.save(seller);
    }

    await this.profileRepo.update(seller.profile.id, data);
    return this.getProfile(sellerId);
  }

  async deleteProfile(sellerId: number) {
    const seller = await this.sellerRepo.findOne({ where: { id: sellerId }, relations: ['profile'] });
    if (!seller) throw new BadRequestException('Seller not found');
    if (!seller.profile) throw new NotFoundException('Profile not found');

    await this.profileRepo.delete(seller.profile.id);
    return { message: 'Profile deleted successfully' };
  }
}
