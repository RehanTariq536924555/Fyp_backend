import { Controller, Get, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserRecommendations(
    @Request() req,
    @Query('currentAnimalId') currentAnimalId?: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user.userId;
    const animalId = currentAnimalId ? parseInt(currentAnimalId) : undefined;
    const limitNum = limit ? parseInt(limit) : 6;

    return this.recommendationsService.getUserRecommendations(userId, animalId, limitNum);
  }

  @Get('popular')
  async getPopularRecommendations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 6;
    return this.recommendationsService.getPopularRecommendations(limitNum);
  }

  @Get('animal/:id')
  async getAnimalRecommendations(
    @Param('id', ParseIntPipe) animalId: number,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 6;
    
    // For non-authenticated users, return popular recommendations excluding current animal
    return this.recommendationsService.getPopularRecommendations(limitNum);
  }
}