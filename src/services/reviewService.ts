// Mock review service - replace with actual API calls when backend is ready
export interface Review {
  id: string;
  userId: string;
  gymId: string;
  rating: number;
  comment: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CreateReviewData {
  gymId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating: number;
  comment: string;
}

class ReviewService {
  private reviews: Review[] = [
    {
      id: '1',
      userId: '1',
      gymId: '1',
      rating: 5,
      comment: 'Excellent equipment and friendly staff! The trainers are very knowledgeable and the facilities are always clean.',
      userName: 'Sarah M.',
      userAvatar: '',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      userId: '2',
      gymId: '1',
      rating: 4,
      comment: 'Clean facilities and great trainers. Sometimes gets a bit crowded during peak hours.',
      userName: 'Raj K.',
      userAvatar: '',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId: '3',
      gymId: '1',
      rating: 5,
      comment: 'Best gym in the area, highly recommended! Great value for money and excellent customer service.',
      userName: 'Priya S.',
      userAvatar: '',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      userId: '4',
      gymId: '2',
      rating: 4,
      comment: 'Modern equipment and good atmosphere. Would definitely recommend to fitness enthusiasts.',
      userName: 'Alex T.',
      userAvatar: '',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      userId: '5',
      gymId: '2',
      rating: 5,
      comment: 'Outstanding gym with top-notch facilities. The personal trainers are amazing!',
      userName: 'Maria L.',
      userAvatar: '',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Create a new review
  async createReview(reviewData: CreateReviewData): Promise<{ success: boolean; data?: Review; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already reviewed this gym (mock user ID)
      const existingReview = this.reviews.find(r => r.gymId === reviewData.gymId && r.userId === 'current-user');
      if (existingReview) {
        return {
          success: false,
          message: 'You have already reviewed this gym'
        };
      }

      const newReview: Review = {
        id: Date.now().toString(),
        userId: 'current-user',
        gymId: reviewData.gymId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        userName: 'You',
        userAvatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.reviews.push(newReview);

      return {
        success: true,
        data: newReview,
        message: 'Review created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create review'
      };
    }
  }

  // Get reviews for a gym
  async getGymReviews(gymId: string, page: number = 1, limit: number = 10): Promise<{
    success: boolean;
    data?: {
      reviews: Review[];
      pagination: {
        currentPage: number;
        totalReviews: number;
        hasMore: boolean;
        limit: number;
      };
      stats: ReviewStats;
    };
    message: string;
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const gymReviews = this.reviews
        .filter(review => review.gymId === gymId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const offset = (page - 1) * limit;
      const paginatedReviews = gymReviews.slice(offset, offset + limit);

      const stats = this.calculateStats(gymReviews);

      return {
        success: true,
        data: {
          reviews: paginatedReviews,
          pagination: {
            currentPage: page,
            totalReviews: gymReviews.length,
            hasMore: (offset + limit) < gymReviews.length,
            limit
          },
          stats
        },
        message: 'Reviews retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get reviews'
      };
    }
  }

  // Get stats for a gym
  async getGymStats(gymId: string): Promise<{ success: boolean; data?: ReviewStats; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      const gymReviews = this.reviews.filter(review => review.gymId === gymId);
      const stats = this.calculateStats(gymReviews);

      return {
        success: true,
        data: stats,
        message: 'Stats retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get stats'
      };
    }
  }

  // Update a review
  async updateReview(reviewId: string, updateData: UpdateReviewData): Promise<{ success: boolean; data?: Review; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reviewIndex = this.reviews.findIndex(r => r.id === reviewId && r.userId === 'current-user');
      if (reviewIndex === -1) {
        return {
          success: false,
          message: 'Review not found or you do not have permission to update it'
        };
      }

      this.reviews[reviewIndex] = {
        ...this.reviews[reviewIndex],
        rating: updateData.rating,
        comment: updateData.comment,
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: this.reviews[reviewIndex],
        message: 'Review updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update review'
      };
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reviewIndex = this.reviews.findIndex(r => r.id === reviewId && r.userId === 'current-user');
      if (reviewIndex === -1) {
        return {
          success: false,
          message: 'Review not found or you do not have permission to delete it'
        };
      }

      this.reviews.splice(reviewIndex, 1);

      return {
        success: true,
        message: 'Review deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete review'
      };
    }
  }

  // Check if user can review gym
  async canUserReview(gymId: string): Promise<{ success: boolean; data?: { canReview: boolean }; message: string }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock: Check if user has subscription and hasn't reviewed yet
      const hasReviewed = this.reviews.some(r => r.gymId === gymId && r.userId === 'current-user');
      const canReview = !hasReviewed; // Simplified: user can review if they haven't reviewed yet

      return {
        success: true,
        data: { canReview },
        message: 'Review eligibility checked'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check review eligibility'
      };
    }
  }

  // Calculate stats from reviews
  private calculateStats(reviews: Review[]): ReviewStats {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
      ratingDistribution
    };
  }
}

export const reviewService = new ReviewService();
