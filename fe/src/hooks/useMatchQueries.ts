import { useQuery } from '@tanstack/react-query';
import { matchService, type MatchDetail, type ExploreParams } from '../services/matchService';

// Định nghĩa Query Keys tập trung quản lý cache trận đấu
export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: () => [...matchKeys.lists()] as const,
  schedule: () => [...matchKeys.all, 'schedule'] as const,
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: number) => [...matchKeys.details(), id] as const,
  explore: (search: string) => [...matchKeys.all, 'explore', search] as const,
};

// Hook truy vấn danh sách tất cả các trận đấu gợi ý
export function useMatchesQuery() {
  return useQuery<MatchDetail[]>({
    queryKey: matchKeys.list(),
    queryFn: () => matchService.getMatches(),
  });
}

// Hook truy vấn lịch trình cá nhân của người dùng hiện tại
export function useScheduleQuery(enabled: boolean) {
  return useQuery<MatchDetail[]>({
    queryKey: matchKeys.schedule(),
    queryFn: () => matchService.getSchedule(),
    enabled,
  });
}

// Hook truy vấn chi tiết một trận đấu cụ thể theo ID
export function useMatchDetailQuery(id: number) {
  return useQuery<MatchDetail>({
    queryKey: matchKeys.detail(id),
    queryFn: () => matchService.getMatch(id),
    enabled: !isNaN(id) && id > 0,
  });
}

// Hook truy vấn danh sách kết quả tìm kiếm/khám phá trận đấu
export function useExploreQuery(params: ExploreParams, search: string) {
  return useQuery<MatchDetail[]>({
    queryKey: matchKeys.explore(search || 'default'),
    queryFn: () => matchService.exploreMatches(params, search || 'default'),
  });
}
