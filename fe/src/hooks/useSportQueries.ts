import { useQuery } from '@tanstack/react-query';
import { sportService, type SportItem } from '../services/sportService';

export const sportKeys = {
  all: ['sports'] as const,
};

// Hook truy vấn danh sách môn thể thao với thời gian cache dài 24 tiếng (vì danh mục thể thao rất ít khi thay đổi)
export function useSportsQuery() {
  return useQuery<SportItem[]>({
    queryKey: sportKeys.all,
    queryFn: () => sportService.getSports(),
    staleTime: 24 * 60 * 60 * 1000, // Cache 24 giờ
  });
}
