import React, { useRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { matchService } from '../../services/matchService';
import { matchKeys } from '../../hooks/useMatchQueries';

interface PrefetchMatchLinkProps extends Omit<LinkProps, 'onMouseEnter' | 'onMouseLeave'> {
  matchId: number;
  delay?: number; // Thời gian chờ di chuột (ms) trước khi gọi prefetch
}

export const PrefetchMatchLink: React.FC<PrefetchMatchLinkProps> = ({ 
  matchId, 
  delay = 150, 
  to, 
  children, 
  ...props 
}) => {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    // Chỉ kích hoạt prefetch nếu người dùng di chuột ở lại trên thẻ quá thời gian trì hoãn (delay)
    timerRef.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: matchKeys.detail(matchId),
        queryFn: () => matchService.getMatch(matchId),
      });
    }, delay);
  };

  const handleMouseLeave = () => {
    // Hủy bỏ việc tải trước nếu người dùng di chuột ra ngoài trước khi hết thời gian chờ
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
};

export default PrefetchMatchLink;
