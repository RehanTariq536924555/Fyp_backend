import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Order } from '../order/order.entity';
import { Listing } from '../listings/entities/listing.entity';

export interface RecommendationScore {
  listingId: number;
  score: number;
  reasons: string[];
}

export interface UserPreferences {
  preferredTypes: string[];
  preferredBreeds: string[];
  priceRange: { min: number; max: number };
  locationPreference: string[];
  avgSpending: number;
}

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
  ) {}

  async getUserRecommendations(userId: number, currentAnimalId?: number, limit: number = 6): Promise<any[]> {
    try {
      // Get user's purchase history
      const userOrders = await this.orderRepository.find({
        where: { buyerId: userId },
        order: { date: 'DESC' }
      });

      // Get user preferences from purchase history
      const userPreferences = this.analyzeUserPreferences(userOrders);

      // Get all available listings (excluding current animal if provided)
      const availableListings = await this.listingRepository.find({
        where: currentAnimalId ? { id: Not(currentAnimalId) } : {},
        relations: ['seller']
      });

      // Calculate recommendation scores
      const recommendations = this.calculateRecommendationScores(
        availableListings,
        userPreferences,
        userOrders
      );

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => ({
          ...rec.listing,
          recommendationScore: rec.score,
          recommendationReasons: rec.reasons
        }));

    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to popular/recent listings
      return this.getFallbackRecommendations(currentAnimalId, limit);
    }
  }

  private analyzeUserPreferences(orders: Order[]): UserPreferences {
    if (orders.length === 0) {
      return {
        preferredTypes: [],
        preferredBreeds: [],
        priceRange: { min: 0, max: 1000000 },
        locationPreference: [],
        avgSpending: 50000
      };
    }

    const types = new Map<string, number>();
    const breeds = new Map<string, number>();
    const locations = new Map<string, number>();
    let totalSpent = 0;
    let totalItems = 0;

    orders.forEach(order => {
      totalSpent += order.total || 0;

      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          totalItems++;

          // Analyze animal type from item
          if (item.type) {
            types.set(item.type, (types.get(item.type) || 0) + 1);
          }

          // Analyze breed from item
          if (item.breed) {
            breeds.set(item.breed, (breeds.get(item.breed) || 0) + 1);
          }

          // Note: Item location not available in order items structure
        });
      }
    });

    const avgSpending = totalItems > 0 ? totalSpent / totalItems : 50000;
    const priceRange = {
      min: Math.max(0, avgSpending * 0.5),
      max: avgSpending * 2
    };

    return {
      preferredTypes: Array.from(types.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([type]) => type),
      preferredBreeds: Array.from(breeds.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([breed]) => breed),
      priceRange,
      locationPreference: Array.from(locations.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([location]) => location),
      avgSpending
    };
  }

  private calculateRecommendationScores(
    listings: any[],
    preferences: UserPreferences,
    userOrders: Order[]
  ): Array<{ listing: any; score: number; reasons: string[] }> {
    return listings.map(listing => {
      let score = 0;
      const reasons: string[] = [];

      // Base score
      score += 10;

      // Type preference scoring
      if (preferences.preferredTypes.includes(listing.type)) {
        const typeIndex = preferences.preferredTypes.indexOf(listing.type);
        const typeScore = (3 - typeIndex) * 15;
        score += typeScore;
        reasons.push(`Matches your preferred ${listing.type} type`);
      }

      // Breed preference scoring
      if (preferences.preferredBreeds.includes(listing.breed)) {
        const breedIndex = preferences.preferredBreeds.indexOf(listing.breed);
        const breedScore = (3 - breedIndex) * 10;
        score += breedScore;
        reasons.push(`You've bought ${listing.breed} breed before`);
      }

      // Price range scoring
      if (listing.price >= preferences.priceRange.min && listing.price <= preferences.priceRange.max) {
        score += 20;
        reasons.push('Within your typical price range');
      } else if (listing.price < preferences.priceRange.min) {
        score += 10;
        reasons.push('Great value option');
      }

      // Location scoring
      if (preferences.locationPreference.includes(listing.location)) {
        score += 10;
        reasons.push('In your preferred location');
      }

      // Recency bonus
      // Use listing.createdAt if available, else fallback to 0 days
      let daysSinceCreated = 0;
      if (listing.createdAt) {
        daysSinceCreated = Math.floor(
          (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      if (daysSinceCreated <= 7) {
        score += 5;
        reasons.push('Recently listed');
      }

      // Quality indicators
      if (listing.images && listing.images.length > 1) {
        score += 3;
        reasons.push('Multiple photos available');
      }

      if (listing.description && listing.description.length > 50) {
        score += 2;
        reasons.push('Detailed description');
      }

      // Avoid recommending items too similar to recent purchases
      const recentSimilarPurchases = userOrders
        .slice(0, 3)
        .some(order =>
          order.items?.some((item: any) =>
            item.type === listing.type && item.breed === listing.breed
          )
        );

      if (recentSimilarPurchases) {
        score *= 0.7;
        reasons.push('Similar to recent purchase - exploring variety');
      }

      return {
        listing,
        score: Math.round(score),
        reasons: reasons.slice(0, 3)
      };
    });
  }

  private async getFallbackRecommendations(currentAnimalId?: number, limit: number = 6): Promise<any[]> {
    try {
      const whereCondition = currentAnimalId ? { id: Not(currentAnimalId) } : {};

      const listings = await this.listingRepository.find({
        where: whereCondition,
        relations: ['seller'],
        order: { id: 'DESC' },
        take: limit * 2
      });

      return listings
        .map(listing => ({
          ...listing,
          recommendationScore: Math.floor(Math.random() * 20) + 60,
          recommendationReasons: ['Popular choice', 'Recently added']
        }))
        .slice(0, limit);

    } catch (error) {
      console.error('Error in fallback recommendations:', error);
      return [];
    }
  }

  async getPopularRecommendations(limit: number = 6): Promise<any[]> {
    try {
      const rawQuery = `
        SELECT item.value->>'id' AS "itemId", COUNT(*) AS "purchaseCount"
        FROM "order", LATERAL jsonb_array_elements("order"."items") AS item
        GROUP BY item.value->>'id'
        ORDER BY "purchaseCount" DESC
        LIMIT $1
      `;
      const popularItems = await this.orderRepository.query(rawQuery, [limit]);

      if (!popularItems || popularItems.length === 0) {
        return this.getFallbackRecommendations(undefined, limit);
      }

      // Convert string IDs to numbers if necessary
      const itemIds = popularItems.map((item: any) => Number(item.itemId)).filter(id => !!id);

      const listings = await this.listingRepository.find({
        where: { id: In(itemIds.slice(0, limit)) },
        relations: ['seller']
      });

      return listings.map(listing => ({
        ...listing,
        recommendationScore: 85,
        recommendationReasons: ['Popular choice', 'Frequently purchased']
      }));

    } catch (error) {
      console.error('Error getting popular recommendations:', error);
      return this.getFallbackRecommendations(undefined, limit);
    }
  }
}