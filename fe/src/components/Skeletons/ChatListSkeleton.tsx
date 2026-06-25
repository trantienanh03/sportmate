import React from 'react';

export const ChatListSkeleton: React.FC = () => {
  return (
    <div className="d-flex flex-column gap-1 w-100" style={{ cursor: 'default' }}>
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="d-flex align-items-center gap-3 p-3 border-bottom">
          {/* Room avatar */}
          <div className="skeleton-shimmer skeleton-circle" style={{ width: '48px', height: '48px', flexShrink: 0 }} />
          
          {/* Room info */}
          <div className="flex-grow-1 overflow-hidden">
            <div className="d-flex justify-content-between align-items-center mb-2">
              {/* Room name */}
              <div className="skeleton-shimmer" style={{ height: '14px', width: '120px', borderRadius: '4px' }} />
              {/* Last message time */}
              <div className="skeleton-shimmer" style={{ height: '10px', width: '40px', borderRadius: '4px' }} />
            </div>
            {/* Last message content */}
            <div className="skeleton-shimmer" style={{ height: '12px', width: '80%', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatListSkeleton;
