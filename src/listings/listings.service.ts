import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>,
  ) {}

async create(dto: CreateListingDto, imagePaths: string[], sellerId: number | string): Promise<Listing> {
  const listing = this.listingsRepository.create({
    ...dto,
    images: imagePaths,
    // Only set seller relation if sellerId is a number (real seller)
    // For admin (string ID), don't set seller relation
    ...(typeof sellerId === 'number' ? { seller: { id: sellerId } } : {}),
  });
  return this.listingsRepository.save(listing);
}

  // async findAll(): Promise<Listing[]> {
  //   return this.listingsRepository.find({
  //     relations: ['seller', 'seller.profile'],
  //   });
  // }

  // async findOne(id: number): Promise<Listing> {
  //   const listing = await this.listingsRepository.findOne({
  //     where: { id },
  //     relations: ['seller', 'seller.profile'],
  //   });
  //   if (!listing) throw new NotFoundException(`Listing with ID ${id} not found`);
  //   return listing;
  // }
  async findAll(): Promise<Listing[]> {
  return this.listingsRepository.find({
    relations: ['seller', 'seller.profile'],  // important for listing seller data
  });
}

//   async findOne(id: number): Promise<Listing> {
//   const listing = await this.listingsRepository.findOne({
//     where: { id },
//     relations: ['seller', 'seller.profile'], // <-- Add this!
//   });
//   if (!listing) {
//     throw new NotFoundException(`Listing with ID ${id} not found`);
//   }
//   return listing;
// }
// listings.service.ts
async findOne(id: number): Promise<Listing> {
  const listing = await this.listingsRepository.findOne({
    
    where: { id },
    relations: ['seller', 'seller.profile'], // load seller and seller's profile
  });

  if (!listing) {
    throw new NotFoundException(`Listing with ID ${id} not found`);
  }

  return listing;
}



  async update(id: number, dto: UpdateListingDto, imagePaths?: string[]): Promise<Listing> {
    const listing = await this.listingsRepository.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');

    Object.assign(listing, dto);
    if (imagePaths) listing.images = imagePaths;

    return this.listingsRepository.save(listing);
  }

  async remove(id: number): Promise<{ message: string }> {
    const listing = await this.listingsRepository.findOne({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');

    await this.listingsRepository.remove(listing);
    return { message: 'Listing deleted successfully' };
  }
}
