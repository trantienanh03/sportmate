import React from 'react';

export const MatchCardSkeleton: React.FC = () => {
  return (
    <div className="event-card border-0" style={{ cursor: 'default' }}>
      <div className="event-img-wrapper skeleton-shimmer" style={{ height: '200px', width: '100%' }}>
        {/* Placeholder for image */}
      </div>
      <div className="event-details mt-3" style={{ padding: '0 4px' }}>
        {/* Title skeleton */}
        <div className="skeleton-shimmer mb-2" style={{ height: '20px', width: '90%', borderRadius: '4px' }} />
        <div className="skeleton-shimmer mb-3" style={{ height: '20px', width: '60%', borderRadius: '4px' }} />
        
        {/* Time skeleton */}
        <div className="skeleton-shimmer mb-2" style={{ height: '14px', width: '75%', borderRadius: '4px' }} />
        
        {/* Host details skeleton */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="skeleton-shimmer skeleton-circle" style={{ height: '16px', width: '16px' }} />
          <div className="skeleton-shimmer" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
        </div>

        {/* Location skeleton */}
        <div className="skeleton-shimmer mb-3" style={{ height: '14px', width: '80%', borderRadius: '4px' }} />
        
        {/* Divider & footer skeleton */}
        <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
          <div className="skeleton-shimmer" style={{ height: '16px', width: '35%', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ height: '16px', width: '25%', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
};

export default MatchCardSkeleton;
