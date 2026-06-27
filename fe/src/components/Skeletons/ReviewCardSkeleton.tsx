import React from 'react';

export const ReviewCardSkeleton: React.FC = () => {
  return (
    <div className="review-card-new p-3 mb-3 border rounded-3" style={{ cursor: 'default' }}>
      <div className="d-flex align-items-center gap-3 mb-2">
        {/* Reviewer avatar */}
        <div className="skeleton-shimmer skeleton-circle" style={{ width: '40px', height: '40px', flexShrink: 0 }} />
        
        {/* Reviewer name & metadata */}
        <div className="flex-grow-1">
          <div className="skeleton-shimmer mb-1" style={{ height: '14px', width: '100px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ height: '11px', width: '150px', borderRadius: '4px' }} />
        </div>

        {/* Stars skeleton */}
        <div className="skeleton-shimmer" style={{ height: '14px', width: '80px', borderRadius: '4px' }} />
      </div>

      {/* Review text block */}
      <div className="skeleton-shimmer mt-2 mb-1 w-100" style={{ height: '14px', borderRadius: '4px' }} />
      <div className="skeleton-shimmer w-70" style={{ height: '14px', borderRadius: '4px' }} />
    </div>
  );
};

export default ReviewCardSkeleton;
