import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import ExploreFilterSidebar from '../../components/ExploreFilterSidebar/ExploreFilterSidebar';
import Footer from '../../components/Footer/Footer';
import { type ExploreParams } from '../../services/matchService';
import { useExploreQuery } from '../../hooks/useMatchQueries';
import MatchCardSkeleton from '../../components/Skeletons/MatchCardSkeleton';
import PrefetchMatchLink from '../../components/PrefetchMatchLink/PrefetchMatchLink';
import './ExplorePage.css';

const ExplorePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const search = location.search;

  // Phân tích tham số tìm kiếm từ URL query string
  const { exploreParams, hasLocation } = useMemo(() => {
    const params = new URLSearchParams(search);
    const exploreParams: ExploreParams = {};
    if (params.has('keyword')) exploreParams.keyword = params.get('keyword') as string;
    if (params.has('sport')) exploreParams.sport = params.get('sport') as string;
    if (params.has('skillLevel')) exploreParams.skillLevel = params.get('skillLevel') as string;
    if (params.has('feeType')) exploreParams.feeType = params.get('feeType') as string;
    
    let hasLoc = false;
    if (params.has('lat') && params.has('lng')) {
      exploreParams.lat = parseFloat(params.get('lat') as string);
      exploreParams.lng = parseFloat(params.get('lng') as string);
      hasLoc = true;
    }
    if (params.has('radiusKm')) {
      exploreParams.radiusKm = parseFloat(params.get('radiusKm') as string);
    }
    return { exploreParams, hasLocation: hasLoc };
  }, [search]);

  // Sử dụng React Query để tự động gọi API và cache theo query string
  const { data: matches = [], isLoading, error: queryError } = useExploreQuery(exploreParams, search);
  const error = queryError ? (queryError as Error).message || 'Lỗi khi tìm kiếm trận đấu' : '';

  const getSportImage = (sport: string) => {
    if (!sport) return '/hero_football.png';
    const s = sport.toLowerCase();
    if (s.includes('bóng đá') || s.includes('football') || s.includes('soccer')) return '/hero_football.png';
    if (s.includes('cầu lông') || s.includes('badminton')) return '/hero_badminton.png';
    if (s.includes('bóng rổ') || s.includes('basketball')) return '/hero_basketball.png';
    if (s.includes('tennis') || s.includes('quần vợt')) return '/hero_tennis.png';
    return '/hero_football.png';
  };

  const formatMatchTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1} · ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch {
      return timeStr;
    }
  };

  const translateSkillLevel = (level: string) => {
    if (!level) return 'Mọi trình độ';
    switch (level.toLowerCase()) {
      case 'newbie': return 'Mới chơi';
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      case 'all': return 'Mọi trình độ';
      default: return level;
    }
  };

  return (
    <div className="explore-page">
      <LoggedInNavbar />

      <main className="explore-main py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <ExploreFilterSidebar />
            </div>

            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0">Kết quả Khám phá</h3>
                {hasLocation && (
                  <span className="badge bg-primary rounded-pill px-3 py-2 fw-medium">
                    <i className="fa-solid fa-location-dot me-2"></i>Đã lọc theo vị trí
                  </span>
                )}
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              {isLoading ? (
                <div className="row g-4">
                  {Array(6).fill(0).map((_, i) => (
                    <div className="col-xl-4 col-md-6" key={`skeleton-${i}`}>
                      <MatchCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : matches.length === 0 ? (
                <div className="empty-explore-state text-center py-5 my-5">
                  <div className="empty-icon-wrapper mb-4">
                    <i className="fa-solid fa-magnifying-glass-location fa-3x text-muted"></i>
                  </div>
                  <h4 className="fw-bold">Không tìm thấy trận đấu phù hợp</h4>
                  <p className="text-muted mb-4">
                    Thử mở rộng bán kính tìm kiếm hoặc thay đổi bộ lọc để xem thêm các trận đấu khác.
                  </p>
                  <Link to="/home" className="btn btn-dark rounded-pill px-4">Quay lại Trang chủ</Link>
                </div>
              ) : (
                <div className="row g-4">
                  {matches.map((match) => (
                    <div className="col-xl-4 col-md-6" key={match.id}>
                  <PrefetchMatchLink 
                    matchId={match.id}
                    to={`/matches/${match.id}`} 
                    className="text-decoration-none text-dark"
                  >
                    <div className="explore-event-card h-100">
                      <div className="event-img-wrapper">
                        <img src={match.imageUrl || getSportImage(match.sport)} alt={match.title} className="event-img" />
                        
                        {/* Distance Badge */}
                        {match.distance !== undefined && match.distance !== null && (
                          <div className="distance-badge shadow-sm">
                            <i className="fa-solid fa-location-arrow me-1"></i>
                            Cách {match.distance} km
                          </div>
                        )}
                        
                        <button className="like-btn" onClick={(e) => e.preventDefault()}>
                          <i className="fa-regular fa-heart"></i>
                        </button>
                      </div>
                      
                      <div className="event-details p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="sport-badge">{match.sport}</span>
                          <span className="skill-badge">{translateSkillLevel(match.skillLevel)}</span>
                        </div>
                        
                        <h5 className="event-title fw-bold mb-2" title={match.title}>
                          {match.title}
                        </h5>
                        
                        <p className="event-time text-primary small fw-bold mb-2">
                          <i className="fa-regular fa-clock me-1"></i> {formatMatchTime(match.startTime)}
                        </p>
                        
                        <p className="event-location text-muted small mb-3 text-truncate">
                          <i className="fa-solid fa-location-dot me-1"></i>
                          {match.venue?.name || match.locationText || 'Chưa có địa điểm'}
                        </p>
                        
                        <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                          <div className="d-flex align-items-center">
                            <div className="host-avatar me-2 position-relative" style={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (match.host?.id) navigate(`/profile/${match.host.id}`); }}>
                              {match.host?.avatarUrl ? (
                                <img src={match.host.avatarUrl} alt={match.host.fullName} />
                              ) : (
                                <span>{match.host?.fullName?.charAt(0) || 'U'}</span>
                              )}
                              {match.host?.badges?.includes('Cảnh báo uy tín') && (
                                <div className="position-absolute top-0 start-100 translate-middle" style={{ zIndex: 5, marginTop: '2px', marginLeft: '-5px' }}>
                                  <i className="fa-solid fa-triangle-exclamation text-danger bg-white rounded-circle" style={{ fontSize: '12px' }}></i>
                                </div>
                              )}
                            </div>
                            <span className="small text-muted fw-medium text-truncate" style={{ maxWidth: '80px', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (match.host?.id) navigate(`/profile/${match.host.id}`); }}>
                              {match.host?.fullName}
                            </span>
                          </div>
                          
                          <div className="text-end">
                            <div className="fw-bold text-dark small mb-1">
                              {match.feePerPerson === 0 ? 'Miễn phí' : `${match.feePerPerson.toLocaleString('vi-VN')}đ`}
                            </div>
                            <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              {match.currentPlayers || 1}/{match.maxPlayers} người
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PrefetchMatchLink>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExplorePage;
