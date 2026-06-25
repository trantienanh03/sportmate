import React from 'react';

export const MatchDetailSkeleton: React.FC = () => {
  return (
    <div className="match-detail-page bg-light min-vh-100" style={{ cursor: 'default' }}>
      {/* Top Banner section */}
      <div className="bg-white pt-4 pb-4 border-bottom">
        <div className="container">
          {/* Match Title */}
          <div className="skeleton-shimmer mb-4" style={{ height: '36px', width: '60%', borderRadius: '6px' }} />
          
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              {/* Host avatar */}
              <div className="skeleton-shimmer skeleton-circle me-3" style={{ width: '50px', height: '50px' }} />
              <div>
                {/* Host metadata */}
                <div className="skeleton-shimmer mb-1" style={{ height: '14px', width: '80px', borderRadius: '4px' }} />
                <div className="skeleton-shimmer" style={{ height: '18px', width: '150px', borderRadius: '4px' }} />
              </div>
            </div>
            {/* Action button */}
            <div className="skeleton-shimmer" style={{ height: '38px', width: '120px', borderRadius: '50px' }} />
          </div>
        </div>
      </div>

      {/* Main Content section */}
      <div className="container py-4">
        <div className="row position-relative">
          {/* Left Column */}
          <div className="col-lg-8 pe-lg-5 mb-5">
            {/* Banner cover */}
            <div className="skeleton-shimmer mb-5" style={{ height: '320px', width: '100%', borderRadius: '16px' }} />
            
            {/* Details header */}
            <div className="skeleton-shimmer mb-3" style={{ height: '24px', width: '120px', borderRadius: '4px' }} />
            {/* Description card */}
            <div className="white-card p-4 rounded-4 shadow-sm mb-5">
              <div className="skeleton-shimmer mb-2" style={{ height: '16px', width: '100%', borderRadius: '4px' }} />
              <div className="skeleton-shimmer mb-2" style={{ height: '16px', width: '95%', borderRadius: '4px' }} />
              <div className="skeleton-shimmer mb-2" style={{ height: '16px', width: '98%', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ height: '16px', width: '40%', borderRadius: '4px' }} />
            </div>

            {/* Participants header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="skeleton-shimmer" style={{ height: '24px', width: '200px', borderRadius: '4px' }} />
              <div className="skeleton-shimmer" style={{ height: '20px', width: '80px', borderRadius: '4px' }} />
            </div>
            
            {/* Attendees avatars row */}
            <div className="d-flex flex-wrap gap-4 mb-5 p-4 bg-white rounded-4 shadow-sm">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="text-center" style={{ width: '64px' }}>
                  <div className="skeleton-shimmer skeleton-circle mb-2" style={{ width: '64px', height: '64px' }} />
                  <div className="skeleton-shimmer mb-1" style={{ height: '12px', width: '50px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ height: '10px', width: '40px', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column sidebar */}
          <div className="col-lg-4 d-none d-lg-block">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              {/* Date & Time */}
              <div className="d-flex mb-4">
                <div className="skeleton-shimmer skeleton-circle me-3" style={{ width: '24px', height: '24px' }} />
                <div className="w-70">
                  <div className="skeleton-shimmer mb-2" style={{ height: '16px', width: '150px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ height: '12px', width: '100px', borderRadius: '4px' }} />
                </div>
              </div>
              {/* Location info */}
              <div className="d-flex mb-4">
                <div className="skeleton-shimmer skeleton-circle me-3" style={{ width: '24px', height: '24px' }} />
                <div className="w-70">
                  <div className="skeleton-shimmer mb-2" style={{ height: '16px', width: '180px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ height: '12px', width: '220px', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailSkeleton;
