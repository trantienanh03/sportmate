import React from 'react';

export const ScheduleItemSkeleton: React.FC = () => {
  return (
    <div className="d-flex align-items-start gap-2 p-2" style={{ cursor: 'default' }}>
      {/* Icon placeholder circle */}
      <div className="skeleton-shimmer skeleton-circle" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
      
      {/* Text rows placeholders */}
      <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
        {/* Title */}
        <div className="skeleton-shimmer mb-2" style={{ height: '14px', width: '85%', borderRadius: '4px' }} />
        {/* Time */}
        <div className="skeleton-shimmer mb-1" style={{ height: '11px', width: '60%', borderRadius: '4px' }} />
        {/* Venue */}
        <div className="skeleton-shimmer" style={{ height: '11px', width: '70%', borderRadius: '4px' }} />
      </div>
    </div>
  );
};

export default ScheduleItemSkeleton;
