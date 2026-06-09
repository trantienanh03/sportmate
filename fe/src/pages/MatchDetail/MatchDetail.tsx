import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import { useAuth } from '../../context/AuthContext';
import { matchService, type MatchDetail as MatchDetailType } from '../../services/matchService';
import './MatchDetail.css';

const SPORT_IMAGES: Record<string, string> = {
  football: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
  soccer: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
  badminton: 'https://images.unsplash.com/photo-1613918431706-0808f5f3a3fd?auto=format&fit=crop&w=1200&q=80',
  tennis: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  volleyball: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1200&q=80',
  basketball: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
  pickleball: 'https://images.unsplash.com/photo-1515573396941-6f3d8f0c4fbd?auto=format&fit=crop&w=1200&q=80',
  running: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80',
};

const SPORT_EMOJI: Record<string, string> = {
  football: '⚽',
  soccer: '⚽',
  badminton: '🏸',
  tennis: '🎾',
  volleyball: '🏐',
  basketball: '🏀',
  pickleball: '🏓',
  running: '🏃',
  default: '🏅',
};

const getSportImage = (sport: string) => SPORT_IMAGES[sport.toLowerCase()] ?? SPORT_IMAGES.default;
const getSportEmoji = (sport: string) => SPORT_EMOJI[sport.toLowerCase()] ?? SPORT_EMOJI.default;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (start: string, end?: string | null) => {
  const fmt = (value: string) =>
    new Date(value).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  return end ? `${fmt(start)} đến ${fmt(end)}` : fmt(start);
};

const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [confirmAction, setConfirmAction] = useState<'cancel' | 'resume' | null>(null);
  const [popup, setPopup] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);
    matchService
      .getMatch(Number(id))
      .then(setMatch)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const derived = useMemo(() => {
    if (!match) return null;

    const spotsLeft = Math.max(match.maxPlayers - match.currentPlayers, 0);
    const feeLabel = match.feePerPerson === 0 ? 'Miễn phí' : `${match.feePerPerson.toLocaleString('vi-VN')} VND`;
    const heroImage = getSportImage(match.sport);
    const attendees = [
      { id: match.host.id, name: match.host.fullName, role: 'Người tổ chức', avatar: match.host.avatarUrl },
      ...match.participants
        .filter((participant) => participant.userId !== match.host.id)
        .map((participant) => ({
          id: participant.userId,
          name: participant.fullName,
          role: participant.role === 'host' ? 'Người tổ chức' : 'Thành viên',
          avatar: participant.avatarUrl,
        })),
    ];

    return {
      spotsLeft,
      feeLabel,
      heroImage,
      attendees,
      recurrence: match.status === 'open' ? 'Đang mở cho đăng ký' : 'Đã đóng',
    };
  }, [match]);

  const handleJoin = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      setMatch(await matchService.join(match.id));
    } catch (e) {
      setPopup({ type: 'error', message: e instanceof Error ? e.message : 'Không thể tham gia' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      setMatch(await matchService.leave(match.id));
    } catch (e) {
      setPopup({ type: 'error', message: e instanceof Error ? e.message : 'Không thể rời trận' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelMatch = async () => {
    setConfirmAction('cancel');
  };

  const handleResumeMatch = async () => {
    setConfirmAction('resume');
  };

  const handleConfirmAction = async () => {
    if (!match || !confirmAction) return;

    const isCancel = confirmAction === 'cancel';
    setActionLoading(true);
    try {
      const updated = isCancel ? await matchService.cancelMatch(match.id) : await matchService.resumeMatch(match.id);
      setMatch(updated);
      setPopup({
        type: 'success',
        message: isCancel ? 'Trận đấu đã được hủy.' : 'Trận đấu đã được khôi phục.',
      });
      setConfirmAction(null);
    } catch (e) {
      setPopup({
        type: 'error',
        message: e instanceof Error ? e.message : isCancel ? 'Không thể hủy trận đấu' : 'Không thể khôi phục trận đấu',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostComment = () => {
    if (!comment.trim()) return;
    setPopup({ type: 'info', message: 'Thảo luận hiện chưa kết nối backend. Nội dung bạn nhập: ' + comment.trim() });
    setComment('');
  };

  if (loading) {
    return (
      <div className="match-detail-page bg-light min-vh-100">
        <LoggedInNavbar />
        <div className="md-center-state">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  if (error || !match || !derived) {
    return (
      <div className="match-detail-page bg-light min-vh-100">
        <LoggedInNavbar />
        <div className="md-center-state md-error-text">{error ?? 'Match not found'}</div>
      </div>
    );
  }

  const isHost = user?.id === match.host.id;
  const isLocked = match.status === 'cancelled' || match.status === 'completed';
  const canHostCancel = isHost && (match.status === 'open' || match.status === 'full');
  const canHostResume = isHost && match.status === 'cancelled';
  const timeLabel = formatTime(match.startTime, match.endTime);
  const dateLabel = formatDate(match.startTime);
  const title = match.title;
  const address = match.venue?.address || match.locationText || 'Chưa có địa điểm';
  const venueName = match.venue?.name || match.locationText || 'TBD';
  const confirmTitle = confirmAction === 'cancel' ? 'Xác nhận hủy trận' : 'Khôi phục trận đấu';
  const confirmMessage =
    confirmAction === 'cancel'
      ? 'Bạn có chắc muốn hủy trận đấu này không?'
      : 'Khôi phục trận đấu để tiếp tục tuyển người?';
  const popupTitle =
    popup?.type === 'success' ? 'Thành công' : popup?.type === 'error' ? 'Có lỗi xảy ra' : 'Thông báo';

  return (
    <div className="match-detail-page bg-light min-vh-100">
      <LoggedInNavbar />

      <div className="bg-white pt-4 pb-4 border-bottom">
        <div className="container">
          <h1 className="fw-bolder mb-4 match-title">{title}</h1>
          <div className="d-flex align-items-center">
            <img
              src={match.host.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.host.fullName)}&background=3b82f6&color=fff`}
              alt={match.host.fullName}
              className="rounded-circle me-3 border"
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            />
            <div>
              <p className="mb-0 text-muted small fw-medium">Tổ chức bởi</p>
              <h6 className="fw-bold mb-0">{match.host.fullName}</h6>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row position-relative">
          <div className="col-lg-8 pe-lg-5 mb-5">
            <div className="md-cover-wrap shadow-sm mb-5">
              <img src={derived.heroImage} alt={title} className="w-100 object-fit-cover md-cover-img" />
              <div className="md-cover-overlay">
                <div className="md-cover-emoji">{getSportEmoji(match.sport)}</div>
                {match.status === 'open' && <span className="md-cover-badge">Đang mở</span>}
              </div>
            </div>

            <h4 className="fw-bold mb-3">Chi tiết</h4>
            <div className="mb-5 text-break match-description white-card p-4 rounded-4 shadow-sm">
              {match.description || 'Chưa có mô tả cho trận đấu này.'}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0 d-flex align-items-center">
                Người tham gia
                <span className="badge bg-secondary bg-opacity-10 text-dark rounded-pill ms-2 fs-6">
                  {derived.attendees.length}
                </span>
              </h4>
              <a href="#" className="text-primary fw-medium text-decoration-none">Xem tất cả</a>
            </div>

            <div className="d-flex flex-wrap gap-4 mb-5 p-4 bg-white rounded-4 shadow-sm">
              {derived.attendees.map((attendee) => (
                <div key={attendee.id} className="text-center attendee-item">
                  <img
                    src={attendee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=eff6ff&color=2563eb`}
                    alt={attendee.name}
                    className="rounded-circle mb-2 border"
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                  />
                  <p className="fw-bold mb-0 small text-truncate" style={{ maxWidth: '80px' }}>{attendee.name.split(' ')[0]}</p>
                  <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>{attendee.role}</p>
                </div>
              ))}
            </div>

            <h4 className="fw-bold mb-3">Thảo luận</h4>
            <div className="card border-0 bg-white shadow-sm rounded-4 p-4 mb-5">
              <div className="d-flex align-items-start mb-3">
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? 'User')}&background=3b82f6&color=fff`}
                  className="rounded-circle me-3 mt-1"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  alt="User"
                />
                <div className="flex-grow-1">
                  <textarea
                    className="form-control bg-light border-0 rounded-3"
                    rows={2}
                    placeholder="Thêm bình luận..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="text-end mt-2">
                    <button className="btn btn-secondary fw-bold px-4 rounded-pill" onClick={handlePostComment} disabled={!comment.trim()}>
                      Đăng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="card border-0 shadow-sm rounded-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
              <div className="card-body p-4">
                <div className="d-flex mb-4">
                  <div className="me-3 mt-1">
                    <i className="fa-regular fa-clock fs-4 text-muted" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{dateLabel}</h6>
                    <p className="text-muted small mb-0">{timeLabel}</p>
                    <p className="text-muted small mt-1 mb-0 d-flex align-items-center">
                      <i className="fa-solid fa-rotate-right me-1" /> {derived.recurrence}
                    </p>
                  </div>
                </div>

                <div className="d-flex mb-2">
                  <div className="me-3 mt-1">
                    <i className="fa-solid fa-location-dot fs-4 text-muted" />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1">{venueName}</h6>
                    <p className="text-muted small mb-1">{address}</p>
                    {match.venue?.googleMapsUrl && (
                      <a href={match.venue.googleMapsUrl} target="_blank" rel="noreferrer" className="text-primary small text-decoration-none fw-medium d-flex align-items-center">
                        Cách tìm vị trí <i className="fa-solid fa-arrow-up-right-from-square ms-1" style={{ fontSize: '10px' }} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: '90px' }} />

      <div className="fixed-bottom bg-white border-top py-3 sticky-bottom-bar shadow-lg" style={{ zIndex: 1000 }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-none d-sm-block">
              <p className="text-muted fw-bold mb-0" style={{ fontSize: '13px' }}>{dateLabel}</p>
              <h5 className="fw-bolder mb-0 text-truncate" style={{ maxWidth: '300px' }}>{title}</h5>
            </div>

            <div className="d-flex align-items-center ms-auto">
              <div className="text-end me-3 d-none d-md-block">
                <span className="fw-bold fs-6 me-3">{derived.feeLabel}</span>
                <span className="badge bg-warning bg-opacity-25 text-dark border border-warning rounded-pill px-3 py-2 fw-bold">
                  Còn {derived.spotsLeft} chỗ trống
                </span>
              </div>


              <button className="btn btn-light rounded-circle me-3 action-icon-btn d-none d-sm-inline-block">
                <i className="fa-solid fa-arrow-up-from-bracket" />
              </button>

              {canHostCancel ? (
                <button className="btn btn-danger rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleCancelMatch} disabled={actionLoading}>
                  {actionLoading ? '...' : 'Hủy trận đấu'}
                </button>
              ) : canHostResume ? (
                <button className="btn btn-success rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleResumeMatch} disabled={actionLoading}>
                  {actionLoading ? '...' : 'Ngừng hủy & tiếp tục'}
                </button>
              ) : isHost ? (
                <button className="btn btn-dark rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" disabled>
                  {match.status === 'cancelled' ? 'Trận đã hủy' : match.status === 'completed' ? 'Trận đã kết thúc' : 'Bạn là host'}
                </button>
              ) : isLocked ? (
                <button className="btn btn-secondary rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" disabled>
                  {match.status === 'cancelled' ? 'Host đã ngừng hoạt động trận này' : 'Trận đã kết thúc'}
                </button>
              ) : match.joined ? (
                <button className="btn btn-dark rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleLeave} disabled={actionLoading || isLocked}>
                  {actionLoading ? '...' : 'Rời trận'}
                </button>
              ) : (
                <button className="btn btn-dark rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleJoin} disabled={actionLoading || derived.spotsLeft === 0 || isLocked}>
                  {actionLoading ? '...' : 'Tham gia'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {confirmAction && (
        <div className="md-popup-overlay" onClick={() => !actionLoading && setConfirmAction(null)}>
          <div className="md-popup-card" onClick={(event) => event.stopPropagation()}>
            <h5 className="md-popup-title">{confirmTitle}</h5>
            <p className="md-popup-message">{confirmMessage}</p>
            <div className="md-popup-actions">
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setConfirmAction(null)} disabled={actionLoading}>
                Hủy
              </button>
              <button
                className={`btn rounded-pill px-4 ${confirmAction === 'cancel' ? 'btn-danger' : 'btn-success'}`}
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className="md-popup-overlay" onClick={() => setPopup(null)}>
          <div className="md-popup-card" onClick={(event) => event.stopPropagation()}>
            <h5 className={`md-popup-title ${popup.type === 'error' ? 'text-danger' : popup.type === 'success' ? 'text-success' : ''}`}>{popupTitle}</h5>
            <p className="md-popup-message">{popup.message}</p>
            <div className="md-popup-actions md-popup-actions--single">
              <button className="btn btn-dark rounded-pill px-4" onClick={() => setPopup(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;
