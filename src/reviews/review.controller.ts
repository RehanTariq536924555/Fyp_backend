import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './review.entity';

class CreateReviewDto {
  animalId: number;
  userId?: number; // Optional userId
  userName: string;
  rating: number;
  comment: string;
}

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':animalId')
  async getReviews(@Param('animalId') animalId: number): Promise<Review[]> {
    return this.reviewService.findByAnimalId(animalId);
  }

  @Post()
  async createReview(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return this.reviewService.create(createReviewDto);
  }
}