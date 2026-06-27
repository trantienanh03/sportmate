import React from 'react';

export const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="profile-page profile-clean-page" style={{ cursor: 'default' }}>
      <main className="profile-main-area">
        <div className="container profile-container">
          <div className="profile-grid-layout">
            
            {/* Left sidebar skeleton */}
            <div className="profile-sidebar-stack">
              <aside className="profile-sidecard card-shell p-0 overflow-hidden">
                {/* Simulated side cover */}
                <div className="skeleton-shimmer w-100" style={{ height: '80px' }} />
                <div className="profile-side-body p-4 text-center">
                  {/* Avatar circle */}
                  <div className="skeleton-shimmer skeleton-circle mx-auto mb-3" style={{ width: '100px', height: '100px', marginTop: '-50px' }} />
                  
                  {/* Name placeholder */}
                  <div className="skeleton-shimmer mb-2" style={{ height: '24px', width: '60%', borderRadius: '4px' }} />
                  
                  {/* Area label */}
                  <div className="skeleton-shimmer mb-3" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                  
                  {/* Bio block */}
                  <div className="skeleton-shimmer mb-2" style={{ height: '14px', width: '90%', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer mb-4" style={{ height: '14px', width: '80%', borderRadius: '4px' }} />
                  
                  {/* Action button */}
                  <div className="skeleton-shimmer w-100" style={{ height: '40px', borderRadius: '8px' }} />
                </div>
              </aside>
              
              {/* Community metrics sidecard */}
              <aside className="profile-sidecard card-shell p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="skeleton-shimmer" style={{ height: '18px', width: '120px', borderRadius: '4px' }} />
                  <div className="skeleton-shimmer" style={{ height: '22px', width: '50px', borderRadius: '50px' }} />
                </div>
                <div className="d-flex gap-3">
                  <div className="skeleton-shimmer flex-grow-1" style={{ height: '60px', borderRadius: '8px' }} />
                  <div className="skeleton-shimmer flex-grow-1" style={{ height: '60px', borderRadius: '8px' }} />
                </div>
              </aside>
            </div>

            {/* Right main column skeleton */}
            <section className="profile-main-column">
              <div className="profile-dual-grid">
                
                {/* Playing styles card */}
                <div className="profile-card card-shell p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="skeleton-shimmer" style={{ height: '20px', width: '140px', borderRadius: '4px' }} />
                  </div>
                  <div className="d-flex flex-column gap-3">
                    <div className="skeleton-shimmer w-100" style={{ height: '110px', borderRadius: '12px' }} />
                    <div className="skeleton-shimmer w-100" style={{ height: '110px', borderRadius: '12px' }} />
                  </div>
                </div>

                {/* Availability card */}
                <div className="profile-card card-shell p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="skeleton-shimmer" style={{ height: '20px', width: '160px', borderRadius: '4px' }} />
                  </div>
                  <div className="skeleton-shimmer w-100" style={{ height: '180px', borderRadius: '12px' }} />
                </div>

              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePageSkeleton;
