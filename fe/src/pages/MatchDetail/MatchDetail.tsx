import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import { useAuth } from '../../context/AuthContext';
import { matchService, type MatchDetail as MatchDetailType } from '../../services/matchService';
import { authService } from '../../services/authService';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useMatchDetailQuery, matchKeys } from '../../hooks/useMatchQueries';
import MatchDetailSkeleton from '../../components/Skeletons/MatchDetailSkeleton';
import MatchComments from '../../components/MatchComments/MatchComments';
import ReportModal from '../../components/ReportModal/ReportModal';
import RatingModal from '../../components/RatingModal/RatingModal';
import { reportService } from '../../services/reportService';
import { ratingService } from '../../services/ratingService';
import './MatchDetail.css';

const SPORT_IMAGES: Record<string, string> = {
  football: '/hero_football.png',
  soccer: '/hero_football.png',
  badminton: '/hero_badminton.png',
  tennis: '/hero_tennis.png',
  volleyball: '/hero_football.png', // Fallback
  basketball: '/hero_basketball.png',
  pickleball: '/hero_tennis.png', // Fallback
  running: '/hero_football.png', // Fallback
  default: '/hero_football.png',
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
  
  const queryClient = useQueryClient();
  const { data: match, isLoading: loading, error: matchError } = useMatchDetailQuery(Number(id));
  const error = matchError ? (matchError as Error).message : null;

  const [confirmAction, setConfirmAction] = useState<'cancel' | 'resume' | 'complete' | null>(null);
  const [popup, setPopup] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPopup, setReportPopup] = useState<{ show: boolean; reportId: number | null }>({ show: false, reportId: null });
  const [myReportId, setMyReportId] = useState<number | null>(null);

  const [rateableParticipants, setRateableParticipants] = useState<any[]>([]);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Mutation tham gia trận đấu có tích hợp Optimistic Update
  const joinMutation = useMutation({
    mutationFn: () => matchService.join(Number(id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(Number(id)) });
      const previousMatch = queryClient.getQueryData<MatchDetailType>(matchKeys.detail(Number(id)));
      if (previousMatch) {
        queryClient.setQueryData<MatchDetailType>(matchKeys.detail(Number(id)), {
          ...previousMatch,
          joined: true,
          currentPlayers: previousMatch.currentPlayers + 1,
          participants: [
            ...previousMatch.participants,
            {
              userId: user?.id || 0,
              fullName: user?.fullName || '',
              avatarUrl: user?.avatarUrl || '',
              role: 'player',
              status: 'joined',
            }
          ]
        });
      }
      return { previousMatch };
    },
    onSuccess: () => {
      if (match?.isApprovalRequired) {
        setPopup({ type: 'success', message: 'Đã gửi yêu cầu tham gia. Vui lòng chờ Host phê duyệt.' });
      } else {
        setPopup({ type: 'success', message: 'Tham gia thành công!' });
      }
    },
    onError: (err, _variables, context) => {
      if (context?.previousMatch) {
        queryClient.setQueryData(matchKeys.detail(Number(id)), context.previousMatch);
      }
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể tham gia' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
      queryClient.invalidateQueries({ queryKey: matchKeys.list() });
    }
  });

  // Mutation rời trận đấu có tích hợp Optimistic Update
  const leaveMutation = useMutation({
    mutationFn: () => matchService.leave(Number(id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(Number(id)) });
      const previousMatch = queryClient.getQueryData<MatchDetailType>(matchKeys.detail(Number(id)));
      if (previousMatch) {
        queryClient.setQueryData<MatchDetailType>(matchKeys.detail(Number(id)), {
          ...previousMatch,
          joined: false,
          currentPlayers: Math.max(previousMatch.currentPlayers - 1, 0),
          participants: previousMatch.participants.filter(p => p.userId !== user?.id)
        });
      }
      return { previousMatch };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMatch) {
        queryClient.setQueryData(matchKeys.detail(Number(id)), context.previousMatch);
      }
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể rời trận' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
      queryClient.invalidateQueries({ queryKey: matchKeys.list() });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: () => matchService.cancelMatch(Number(id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(Number(id)) });
      const previousMatch = queryClient.getQueryData<MatchDetailType>(matchKeys.detail(Number(id)));
      if (previousMatch) {
        queryClient.setQueryData<MatchDetailType>(matchKeys.detail(Number(id)), {
          ...previousMatch,
          status: 'cancelled'
        });
      }
      return { previousMatch };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMatch) {
        queryClient.setQueryData(matchKeys.detail(Number(id)), context.previousMatch);
      }
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể hủy trận đấu' });
    },
    onSettled: (data) => {
      if (data) {
        setPopup({ type: 'success', message: 'Trận đấu đã được hủy.' });
      }
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
      queryClient.invalidateQueries({ queryKey: matchKeys.list() });
    }
  });

  const resumeMutation = useMutation({
    mutationFn: () => matchService.resumeMatch(Number(id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(Number(id)) });
      const previousMatch = queryClient.getQueryData<MatchDetailType>(matchKeys.detail(Number(id)));
      if (previousMatch) {
        queryClient.setQueryData<MatchDetailType>(matchKeys.detail(Number(id)), {
          ...previousMatch,
          status: 'upcoming'
        });
      }
      return { previousMatch };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMatch) {
        queryClient.setQueryData(matchKeys.detail(Number(id)), context.previousMatch);
      }
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể khôi phục trận đấu' });
    },
    onSettled: (data) => {
      if (data) {
        setPopup({ type: 'success', message: 'Trận đấu đã được khôi phục.' });
      }
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
      queryClient.invalidateQueries({ queryKey: matchKeys.list() });
    }
  });

  const completeMutation = useMutation({
    mutationFn: () => matchService.updateMatchStatus(Number(id), 'completed'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(Number(id)) });
      const previousMatch = queryClient.getQueryData<MatchDetailType>(matchKeys.detail(Number(id)));
      if (previousMatch) {
        queryClient.setQueryData<MatchDetailType>(matchKeys.detail(Number(id)), {
          ...previousMatch,
          status: 'completed'
        });
      }
      return { previousMatch };
    },
    onError: (err, _variables, context) => {
      if (context?.previousMatch) {
        queryClient.setQueryData(matchKeys.detail(Number(id)), context.previousMatch);
      }
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể hoàn thành trận đấu' });
    },
    onSettled: (data) => {
      if (data) {
        setPopup({ type: 'success', message: 'Trận đấu đã được xác nhận hoàn thành.' });
      }
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
      queryClient.invalidateQueries({ queryKey: matchKeys.list() });
    }
  });

  const approveMutation = useMutation({
    mutationFn: (participantUserId: number) => matchService.approveParticipant(Number(id), participantUserId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
    },
    onSuccess: () => {
      setPopup({ type: 'success', message: 'Đã duyệt người chơi thành công.' });
    },
    onError: (err) => {
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể duyệt người chơi' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ participantUserId, reason }: { participantUserId: number; reason: string }) =>
      matchService.rejectParticipant(Number(id), participantUserId, reason),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
    },
    onSuccess: () => {
      setPopup({ type: 'success', message: 'Đã từ chối người chơi.' });
      setShowRejectModal({ show: false, participantId: null });
      setRejectReason('');
    },
    onError: (err) => {
      setPopup({ type: 'error', message: err instanceof Error ? err.message : 'Không thể từ chối người chơi' });
    }
  });

  const actionLoading = joinMutation.isPending || leaveMutation.isPending || cancelMutation.isPending || resumeMutation.isPending || completeMutation.isPending || approveMutation.isPending || rejectMutation.isPending;

  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!id) return;

    // WebSocket Connection
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      connectHeaders: {},
      debug: () => {}, 
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/matches/${id}`, (message) => {
        if (message.body) {
          queryClient.invalidateQueries({ queryKey: matchKeys.detail(Number(id)) });
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP Error:", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [id, queryClient]);

  useEffect(() => {
    const checkReportStatus = async () => {
      if (!user || !match) return;
      try {
        const res = await reportService.checkReport(match.id);
        if (res.hasReported && res.reportId) {
          setMyReportId(res.reportId);
        } else {
          setMyReportId(null);
        }
      } catch (e) {
        console.error("Failed to check report status", e);
      }
    };

    const checkRatingStatus = async () => {
      if (!user || !match || match.status !== 'completed') return;
      try {
        const unratedIds = await ratingService.getUnratedParticipantIds(match.id);
        
        const attendeesMap = new Map();
        attendeesMap.set(match.host.id, { id: match.host.id, name: match.host.fullName, avatar: match.host.avatarUrl, isHost: true });
        if (match.participants) {
          match.participants.forEach((p: any) => {
            attendeesMap.set(p.userId, { id: p.userId, name: p.fullName, avatar: p.avatarUrl, isHost: p.role === 'host' });
          });
        }
        
        const allRatees: any[] = [];
        attendeesMap.forEach((ratee, uId) => {
          if (uId !== user.id) {
            allRatees.push(ratee);
          }
        });
        
        if (allRatees.length > 0) {
          setRateableParticipants(allRatees);
          if (unratedIds && unratedIds.length > 0) {
            setShowRatingModal(true);
          }
        }
      } catch (e) {
        console.error("Failed to check rating status", e);
      }
    };

    checkReportStatus();
    checkRatingStatus();
  }, [match, user]);

  const derived = useMemo(() => {
    if (!match) return null;

    const spotsLeft = Math.max(match.maxPlayers - match.currentPlayers, 0);
    const feeLabel = match.feePerPerson === 0 ? 'Miễn phí' : `${match.feePerPerson.toLocaleString('vi-VN')} VND`;
    const heroImage = match.imageUrl || getSportImage(match.sport);
    const attendees = [
      { id: match.host.id, name: match.host.fullName, role: 'Người tổ chức', avatar: match.host.avatarUrl, badges: match.host.badges || [], status: 'joined', rejectReason: undefined },
      ...match.participants
        .filter((participant) => participant.userId !== match.host.id)
        .map((participant) => ({
          id: participant.userId,
          name: participant.fullName,
          role: participant.role === 'host' ? 'Người tổ chức' : 'Thành viên',
          avatar: participant.avatarUrl,
          badges: participant.badges || [],
          status: participant.status,
          rejectReason: participant.rejectReason,
        })),
    ];

    return {
      spotsLeft,
      feeLabel,
      heroImage,
      attendees,
      recurrence: match.status === 'open' ? 'Đang mở cho đăng ký' : match.status === 'completed' ? 'Đã kết thúc' : 'Đã đóng',
    };
  }, [match]);

  const myParticipant = useMemo(() => {
    return match?.participants.find(p => p.userId === user?.id);
  }, [match, user]);

  const [showRejectModal, setShowRejectModal] = useState<{ show: boolean, participantId: number | null }>({ show: false, participantId: null });
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (participantId: number) => {
    approveMutation.mutate(participantId);
  };

  const submitReject = () => {
    if (!showRejectModal.participantId) return;
    rejectMutation.mutate({ participantUserId: showRejectModal.participantId, reason: rejectReason });
  };

  const handleJoin = () => {
    joinMutation.mutate();
  };

  const handleLeave = () => {
    leaveMutation.mutate();
  };

  const handleCancelMatch = async () => {
    setConfirmAction('cancel');
  };

  const handleResumeMatch = async () => {
    setConfirmAction('resume');
  };

  const handleCompleteMatch = async () => {
    setConfirmAction('complete');
  };

  // Xác nhận hành động (hủy, khôi phục hoặc hoàn thành) và thực hiện gọi API tương ứng
  const handleConfirmAction = async () => {
    if (!match || !confirmAction) return;

    if (confirmAction === 'cancel') {
      cancelMutation.mutate();
    } else if (confirmAction === 'complete') {
      completeMutation.mutate();
    } else {
      resumeMutation.mutate();
    }
    setConfirmAction(null);
  };

  const handleUndoReport = async (reportId: number) => {
    try {
      await reportService.deleteReport(reportId);
      setMyReportId(null);
      setReportPopup({ show: false, reportId: null });
      setPopup({ type: 'success', message: 'Đã hoàn tác báo cáo thành công.' });
    } catch (e: any) {
      setPopup({ type: 'error', message: 'Không thể hoàn tác báo cáo: ' + (e.message || 'Lỗi không xác định') });
    }
  };

  if (loading || !match || !derived) {
    return <MatchDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="match-detail-page bg-light min-vh-100">
        <LoggedInNavbar />
        <div className="md-center-state md-error-text">{error}</div>
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
  const confirmTitle = 
    confirmAction === 'cancel' 
      ? 'Xác nhận hủy trận' 
      : confirmAction === 'complete'
      ? 'Xác nhận hoàn thành trận'
      : 'Khôi phục trận đấu';

  const confirmMessage =
    confirmAction === 'cancel'
      ? 'Bạn có chắc muốn hủy trận đấu này không?'
      : confirmAction === 'complete'
      ? 'Bạn có chắc chắn muốn xác nhận trận đấu này đã hoàn thành không?'
      : 'Khôi phục trận đấu để tiếp tục tuyển người?';
  const popupTitle =
    popup?.type === 'success' ? 'Thành công' : popup?.type === 'error' ? 'Có lỗi xảy ra' : 'Thông báo';

  return (
    <div className="match-detail-page bg-light min-vh-100">
      <LoggedInNavbar />

      <div className="bg-white pt-4 pb-4 border-bottom">
        <div className="container">
          <h1 className="fw-bolder mb-4 match-title">{title}</h1>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Link 
                to={`/profile/${match.host.id}`} 
                className="text-decoration-none text-dark d-flex align-items-center"
                onMouseEnter={() => {
                  if (!authService.hasCachedProfile(match.host.id)) {
                    authService.getOtherProfile(match.host.id).catch(() => {});
                  }
                }}
              >
                <img
                  src={match.host.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.host.fullName)}&background=3b82f6&color=fff`}
                  alt={match.host.fullName}
                  className="rounded-circle me-3 border"
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </Link>
              <div>
                <p className="mb-0 text-muted small fw-medium">Tổ chức bởi</p>
                <h6 className="fw-bold mb-0 d-flex align-items-center flex-wrap gap-1">
                  <Link to={`/profile/${match.host.id}`} className="text-decoration-none text-dark">{match.host.fullName}</Link>
                  {match.host.badges && match.host.badges.map(badge => (
                    <span key={badge} className={`badge rounded-pill fw-normal ms-1 ${badge === 'Tân binh' ? 'bg-secondary' : badge === 'Tích cực' ? 'bg-info' : badge === 'Thân thiện' ? 'bg-success' : badge === 'Cảnh báo uy tín' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '10px' }}>
                      {badge === 'Cảnh báo uy tín' && <i className="fa-solid fa-triangle-exclamation me-1"></i>}
                      {badge}
                    </span>
                  ))}
                </h6>
              </div>
            </div>
            {user && match.host.id !== user.id && (
              myReportId ? (
                <button 
                  className="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3"
                  onClick={() => handleUndoReport(myReportId)}
                  title="Hoàn tác báo cáo"
                >
                  <span>↩️</span> <span className="d-none d-md-inline">Đã báo cáo (Hoàn tác)</span>
                </button>
              ) : (
                <button 
                  className="btn btn-outline-danger d-flex align-items-center gap-2 rounded-pill px-3"
                  onClick={() => setShowReportModal(true)}
                  title="Báo cáo trận đấu này"
                >
                  <span>🚩</span> <span className="d-none d-md-inline">Báo cáo</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="container md-main-container">
        {myParticipant?.status === 'rejected' && (
          <div className="alert alert-danger d-flex align-items-center mb-4 shadow-sm border-0" role="alert" style={{ borderRadius: '12px', backgroundColor: '#fff5f5' }}>
            <i className="fa-solid fa-circle-xmark fs-3 text-danger me-3"></i>
            <div>
              <h6 className="alert-heading fw-bold mb-1">Yêu cầu tham gia bị từ chối</h6>
              <p className="mb-0 text-dark">Lý do: <span className="fw-semibold">{myParticipant.rejectReason || 'Không có lý do cụ thể'}</span></p>
            </div>
          </div>
        )}

        <div className="row g-4 position-relative">
          <div className="col-lg-8 pe-lg-5 mb-5">
            <div className="md-cover-wrap shadow-sm mb-5">
              <img src={derived.heroImage} alt={title} className="w-100 object-fit-cover md-cover-img" />
              <div className="md-cover-overlay">
                <div className="md-cover-emoji">{getSportEmoji(match.sport)}</div>
                {match.status === 'open' && <span className="md-cover-badge">Đang mở</span>}
                {match.status === 'completed' && <span className="md-cover-badge bg-success">Đã kết thúc</span>}
                {match.status === 'cancelled' && <span className="md-cover-badge bg-danger">Đã hủy</span>}
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
              <div className="d-flex align-items-center gap-3">
                {rateableParticipants.length > 0 && (
                  <button 
                    className="btn btn-sm btn-outline-warning fw-bold rounded-pill px-3"
                    onClick={() => setShowRatingModal(true)}
                  >
                    <i className="fa-solid fa-star me-1 text-warning"></i> Đánh giá
                  </button>
                )}
                <a href="#" className="text-primary fw-medium text-decoration-none">Xem tất cả</a>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-4 mb-5 p-4 bg-white rounded-4 shadow-sm">
              {derived.attendees.filter(a => a.status === 'joined' || !a.status).map((attendee) => (
                <Link 
                  key={attendee.id} 
                  to={`/profile/${attendee.id}`} 
                  className="text-center attendee-item position-relative text-decoration-none text-dark d-block"
                  onMouseEnter={() => {
                    if (!authService.hasCachedProfile(attendee.id)) {
                      authService.getOtherProfile(attendee.id).catch(() => {});
                    }
                  }}
                >
                  <img
                    src={attendee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=eff6ff&color=2563eb`}
                    alt={attendee.name}
                    className="rounded-circle mb-2 border"
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                  />
                  {attendee.badges && attendee.badges.length > 0 && (
                    <div className="position-absolute top-0 start-100 translate-middle" style={{ zIndex: 5, marginTop: '10px', marginLeft: '-15px' }}>
                       <span className={`badge rounded-pill border border-white ${attendee.badges[0] === 'Tân binh' ? 'bg-secondary' : attendee.badges[0] === 'Tích cực' ? 'bg-info' : attendee.badges[0] === 'Thân thiện' ? 'bg-success' : attendee.badges[0] === 'Cảnh báo uy tín' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '9px', padding: '0.25em 0.4em' }}>
                         {attendee.badges[0] === 'Cảnh báo uy tín' && <i className="fa-solid fa-triangle-exclamation me-1"></i>}
                         {attendee.badges[0]}
                       </span>
                    </div>
                  )}
                  <p className="fw-bold mb-0 small text-truncate mx-auto text-decoration-none text-dark" style={{ maxWidth: '80px' }}>
                    {attendee.name.split(' ')[0]}
                  </p>
                  <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>{attendee.role}</p>
                </Link>
              ))}
            </div>

            {isHost && derived.attendees.some(a => a.status === 'pending') && (
              <div className="mb-5 p-4 bg-white rounded-4 shadow-sm border border-warning border-opacity-50">
                <h5 className="fw-bold mb-3 text-warning"><i className="fa-solid fa-user-clock me-2"></i>Chờ duyệt tham gia</h5>
                <div className="d-flex flex-column gap-3">
                  {derived.attendees.filter(a => a.status === 'pending').map(attendee => (
                    <div key={attendee.id} className="d-flex align-items-center justify-content-between p-3 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <Link to={`/profile/${attendee.id}`}>
                          <img
                            src={attendee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(attendee.name)}&background=eff6ff&color=2563eb`}
                            alt={attendee.name}
                            className="rounded-circle me-3 border"
                            style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                          />
                        </Link>
                        <div>
                          <p className="fw-bold mb-0">
                            <Link to={`/profile/${attendee.id}`} className="text-decoration-none text-dark">{attendee.name}</Link>
                          </p>
                          {attendee.badges && attendee.badges.length > 0 && (
                            <span className="badge bg-secondary rounded-pill mt-1" style={{ fontSize: '10px' }}>{attendee.badges[0]}</span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm fw-bold rounded-pill px-3" onClick={() => handleApprove(attendee.id)} disabled={actionLoading || match.status !== 'open' || derived.spotsLeft === 0}>
                          Duyệt
                        </button>
                        <button className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-3" onClick={() => setShowRejectModal({ show: true, participantId: attendee.id })} disabled={actionLoading}>
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MatchComments matchId={match.id} />
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
                <span className="badge bg-warning bg-opacity-25 text-dark border border-warning rounded-pill px-3 py-2 fw-bold me-2">
                  Còn {derived.spotsLeft} chỗ trống
                </span>
                <span className={`badge ${match.status === 'open' ? 'bg-white text-dark border' : match.status === 'completed' ? 'bg-success' : 'bg-secondary'} rounded-pill px-3 py-2 fw-bold shadow-sm`}>
                  {match.status === 'open' ? 'Đang mở' : match.status === 'full' ? 'Đã đầy' : match.status === 'completed' ? 'Đã kết thúc' : 'Đã hủy'}
                </span>
              </div>


              <button className="btn btn-light rounded-circle me-3 action-icon-btn d-none d-sm-inline-block">
                <i className="fa-solid fa-arrow-up-from-bracket" />
              </button>

              {canHostCancel ? (
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-danger rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleCancelMatch} disabled={actionLoading}>
                    {actionLoading ? '...' : 'Hủy trận đấu'}
                  </button>
                  <button className="btn btn-success rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleCompleteMatch} disabled={actionLoading}>
                    {actionLoading ? '...' : 'Hoàn thành trận'}
                  </button>
                </div>
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
              ) : myParticipant?.status === 'rejected' ? (
                <button className="btn btn-outline-danger rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleJoin} disabled={actionLoading || isLocked}>
                  {actionLoading ? '...' : 'Bị từ chối - Gửi lại'}
                </button>
              ) : myParticipant?.status === 'pending' ? (
                <button className="btn btn-warning rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleLeave} disabled={actionLoading || isLocked}>
                  {actionLoading ? '...' : 'Hủy xin tham gia'}
                </button>
              ) : match.joined ? (
                <button className="btn btn-dark rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleLeave} disabled={actionLoading || isLocked}>
                  {actionLoading ? '...' : 'Rời trận'}
                </button>
              ) : (
                <button className="btn btn-dark rounded-pill px-4 px-md-5 py-2 fw-bold fs-6 shadow-sm" onClick={handleJoin} disabled={actionLoading || derived.spotsLeft === 0 || isLocked}>
                  {actionLoading ? '...' : (match.isApprovalRequired ? 'Xin tham gia' : 'Tham gia')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRejectModal.show && (
        <div className="md-popup-overlay" onClick={() => !actionLoading && setShowRejectModal({ show: false, participantId: null })}>
          <div className="md-popup-card" onClick={(event) => event.stopPropagation()}>
            <h5 className="md-popup-title text-danger">Từ chối người chơi</h5>
            <p className="md-popup-message text-start">Vui lòng nhập lý do từ chối (người chơi sẽ thấy lý do này):</p>
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="VD: Trình độ chưa phù hợp, Đội hình đã đủ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="md-popup-actions">
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowRejectModal({ show: false, participantId: null })} disabled={actionLoading}>
                Hủy
              </button>
              <button
                className="btn btn-danger rounded-pill px-4"
                onClick={submitReject}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {showReportModal && match && (
        <ReportModal 
          reportedMatchId={match.id}
          onClose={() => setShowReportModal(false)}
          onSuccess={(reportId) => {
            setShowReportModal(false);
            setMyReportId(reportId);
            setReportPopup({ show: true, reportId });
          }}
        />
      )}

      {reportPopup.show && reportPopup.reportId && (
        <div className="md-popup-overlay" onClick={() => setReportPopup({ show: false, reportId: null })}>
          <div className="md-popup-card" onClick={(event) => event.stopPropagation()}>
            <h5 className="md-popup-title text-success">Gửi thành công</h5>
            <p className="md-popup-message">Báo cáo của bạn đã được gửi. Chúng tôi sẽ xem xét sớm nhất!</p>
            <div className="md-popup-actions">
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => handleUndoReport(reportPopup.reportId!)}>
                Hoàn tác
              </button>
              <button className="btn btn-dark rounded-pill px-4" onClick={() => setReportPopup({ show: false, reportId: null })}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showRatingModal && match && (
        <RatingModal 
          matchId={match.id}
          ratees={rateableParticipants}
          onClose={() => setShowRatingModal(false)}
          onSuccess={() => {
            setShowRatingModal(false);
            setPopup({ type: 'success', message: 'Cảm ơn bạn đã gửi đánh giá!' });
          }}
        />
      )}
    </div>
  );
};

export default MatchDetail;
