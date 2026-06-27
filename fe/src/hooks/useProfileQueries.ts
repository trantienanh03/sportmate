import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { ratingService, type UserReviewDto } from '../services/ratingService';

// Định nghĩa Query Keys cho Profile & Nhận xét đánh giá
export const profileKeys = {
  all: ['profiles'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: number) => [...profileKeys.details(), id] as const,
  reviews: (userId: number) => [...profileKeys.all, 'reviews', userId] as const,
};

// Hook truy vấn thông tin Profile của người dùng khác qua ID
export function useProfileQuery(id: number, enabled: boolean) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: () => authService.getOtherProfile(id),
    enabled: enabled && !isNaN(id) && id > 0,
  });
}

// Hook truy vấn danh sách nhận xét đánh giá cộng đồng của người dùng
export function useUserReviewsQuery(userId: number, enabled: boolean) {
  return useQuery<UserReviewDto[]>({
    queryKey: profileKeys.reviews(userId),
    queryFn: () => ratingService.getUserReviews(userId),
    enabled: enabled && !isNaN(userId) && userId > 0,
  });
}
