import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async findByAnimalId(animalId: number): Promise<Review[]> {
    return this.reviewRepository.find({ where: { animalId } });
  }

  async create(review: Partial<Review>): Promise<Review> {
    return this.reviewRepository.save(review);
  }
}