import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import Footer from '../../components/Footer/Footer';
import { useParams, Link } from 'react-router-dom';
import { useAuth, type SportCard, type AvailabilitySlot } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { useProfileQuery, useUserReviewsQuery } from '../../hooks/useProfileQueries';
import ProfilePageSkeleton from '../../components/Skeletons/ProfilePageSkeleton';
import ReviewCardSkeleton from '../../components/Skeletons/ReviewCardSkeleton';
import { ratingService, type UserReviewDto } from '../../services/ratingService';
import { friendshipService, type FriendDto, type FriendshipStatusDto } from '../../services/friendshipService';
import './ProfilePage.css';

type ProfileFormState = {
  fullName: string;
  avatarUrl: string;
  bio: string;
  district: string;
  lat: string;
  lng: string;
};

const formatMonthYear = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const toInputValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const SPORT_CARDS: SportCard[] = [
  {
    name: 'Cầu lông',
    tag: 'Yêu thích',
    level: 'Trung bình',
    note: 'Thiên về phản xạ nhanh và kỹ thuật.',
  },
  {
    name: 'Bóng đá',
    tag: 'Main sport',
    level: 'Trung bình',
    note: 'Vào sân là thích giao lưu và chạy nhiều.',
  },
  {
    name: 'Pickleball',
    tag: 'Tập thêm',
    level: 'Mới',
    note: 'Muốn cải thiện cảm giác bóng và phối hợp đôi.',
  },
];

const SPORT_TAG_OPTIONS = ['Yêu thích', 'Main sport', 'Tập thêm', 'Khác'] as const;

const DEFAULT_WEEK_SLOTS: AvailabilitySlot[] = [
  { label: 'T2', morning: 'Rảnh', afternoon: 'Bận', evening: 'Rảnh' },
  { label: 'T3', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'T4', morning: 'Bận', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'T5', morning: 'Rảnh', afternoon: 'Bận', evening: 'Rảnh' },
  { label: 'T6', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'T7', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'CN', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Bận' },
];

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const currentUser = user;
  const { notifications } = useNotifications();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isOtherUser = !!id && id !== String(currentUser?.id);
  const targetUserId = isOtherUser ? Number(id) : currentUser?.id;

  const [displayedUser, setDisplayedUser] = useState<any>(currentUser);
  const [friendStatus, setFriendStatus] = useState<FriendshipStatusDto>({ status: 'NONE' });
  const [friendsList, setFriendsList] = useState<FriendDto[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendDto[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'friends' | 'requests'>('info');
  const editorRef = useRef<HTMLElement | null>(null);
  
  // Xác định xem có phải là trang cá nhân của chính mình hay không
  const isOwnProfile = !id || Number(id) === user?.id;

  const { data: otherProfile, isLoading: isOtherProfileLoading } = useProfileQuery(Number(id), !isOwnProfile);
  const profileData = isOwnProfile ? user : otherProfile;
  const isProfileLoading = isOwnProfile ? !user : isOtherProfileLoading;

  const targetUserId = isOwnProfile ? user?.id : Number(id);
  const { data: reviews = [], isLoading: isReviewsLoading } = useUserReviewsQuery(Number(targetUserId), !!targetUserId);
  
  // Independent Edit States
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingSports, setIsEditingSports] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  
  // Custom Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'save'; section: 'basic' | 'sports' | 'availability' } | null>(null);
  const [unfriendConfirm, setUnfriendConfirm] = useState<{ show: boolean, userId: number | null, name: string }>({ show: false, userId: null, name: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('upload');
  
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>(DEFAULT_WEEK_SLOTS);
  const [sportCards, setSportCards] = useState<SportCard[]>(SPORT_CARDS);
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: '',
    avatarUrl: '',
    bio: '',
    district: '',
    lat: '',
    lng: '',
  });

  // Tự động đồng bộ các state chỉnh sửa khi dữ liệu profileData thay đổi (từ cache hoặc API)
  useEffect(() => {
    if (!profileData) return;
    setFormData({
      fullName: profileData.fullName ?? '',
      avatarUrl: profileData.avatarUrl ?? '',
      bio: profileData.bio ?? '',
      district: profileData.district ?? '',
      lat: toInputValue(profileData.lat),
      lng: toInputValue(profileData.lng),
    });
    setSportCards(profileData.sports && profileData.sports.length > 0 ? profileData.sports : SPORT_CARDS);
    setAvailabilitySlots(profileData.availability && profileData.availability.length > 0 ? profileData.availability : DEFAULT_WEEK_SLOTS);
  }, [profileData]);

  useEffect(() => {
    if (isOtherUser && id) {
      authService.getOtherProfile(Number(id)).then(setDisplayedUser).catch(console.error);
      friendshipService.getFriendshipStatus(Number(id)).then(setFriendStatus).catch(console.error);
      friendshipService.getUserFriends(Number(id))
        .then(setFriendsList)
        .catch(() => setFriendsList([]));
    } else if (currentUser) {
      setDisplayedUser(currentUser);
      friendshipService.getMyFriends().then(setFriendsList).catch(console.error);
      friendshipService.getPendingRequests().then(setPendingRequests).catch(console.error);
    }
  }, [id, currentUser, isOtherUser]);

  const lastProcessedNotifRef = useRef<number | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      if (latest.id !== lastProcessedNotifRef.current) {
        lastProcessedNotifRef.current = latest.id;
        if (latest.type === 'FRIEND_REQUEST' || latest.type === 'FRIEND_ACCEPTED') {
          if (isOtherUser && id) {
            friendshipService.getFriendshipStatus(Number(id)).then(setFriendStatus).catch(console.error);
            friendshipService.getUserFriends(Number(id)).then(setFriendsList).catch(() => setFriendsList([]));
          } else if (currentUser) {
            friendshipService.getMyFriends().then(setFriendsList).catch(console.error);
            friendshipService.getPendingRequests().then(setPendingRequests).catch(console.error);
          }
        }
      }
    }
  }, [notifications, isOtherUser, id, currentUser]);

  useEffect(() => {
    const handleFriendUpdate = () => {
      if (isOtherUser && id) {
        friendshipService.getFriendshipStatus(Number(id)).then(setFriendStatus).catch(console.error);
        friendshipService.getUserFriends(Number(id)).then(setFriendsList).catch(() => setFriendsList([]));
      } else {
        friendshipService.getMyFriends().then(setFriendsList).catch(console.error);
        friendshipService.getPendingRequests().then(setPendingRequests).catch(console.error);
      }
    };

    window.addEventListener('friendship_update_event', handleFriendUpdate);
    return () => window.removeEventListener('friendship_update_event', handleFriendUpdate);
  }, [isOtherUser, id]);

  // Sync data from user
  useEffect(() => {
    if (!displayedUser) return;

    setFormData({
      fullName: displayedUser.fullName ?? '',
      avatarUrl: displayedUser.avatarUrl ?? '',
      bio: displayedUser.bio ?? '',
      district: displayedUser.district ?? '',
      lat: toInputValue(displayedUser.lat),
      lng: toInputValue(displayedUser.lng),
    });

    if (displayedUser.sports && displayedUser.sports.length > 0) {
      setSportCards(displayedUser.sports);
    }
    if (displayedUser.availability && displayedUser.availability.length > 0) {
      setAvailabilitySlots(displayedUser.availability);
    }

    // Fetch reviews
    ratingService.getUserReviews(displayedUser.id).then(setReviews).catch(console.error);
  }, [displayedUser]);
>>>>>>> 73c02976e4aaea244eb38afb0864282ee7c20ba8

  // Messages timeout
  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(''), 3500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = window.setTimeout(() => setErrorMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [errorMessage]);

  // Lock scrolling when basic modal is open
  useEffect(() => {
    document.body.style.overflow = isEditingBasic ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEditingBasic]);

  const profileInitial = profileData?.fullName?.trim()?.charAt(0).toUpperCase() || 'U';
  
  // Calculate combined rating if both exist, or use whichever exists, or default to 0
  let combinedRating: number | string = 0;
  if (profileData?.avgAttitudeScore != null && profileData?.avgSkillScore != null) {
    combinedRating = ((profileData.avgAttitudeScore + profileData.avgSkillScore) / 2).toFixed(1);
  } else if (profileData?.avgAttitudeScore != null) {
    combinedRating = profileData.avgAttitudeScore.toFixed(1);
  } else if (profileData?.avgSkillScore != null) {
    combinedRating = profileData.avgSkillScore.toFixed(1);
  } else {
    combinedRating = 'Chưa có';
  }

  const memberSince = profileData?.createdAt ? formatMonthYear(profileData.createdAt) : '—';
  const matchCountText = profileData?.completedMatches ? `${profileData.completedMatches} trận` : '0 trận';

  const handleFriendAction = async () => {
    if (!targetUserId) return;
    try {
      if (friendStatus.status === 'NONE') {
        await friendshipService.sendFriendRequest(targetUserId);
        setFriendStatus({ status: 'PENDING_SENT' });
      } else if (friendStatus.status === 'PENDING_SENT') {
        await friendshipService.unfriend(targetUserId);
        setFriendStatus({ status: 'NONE' });
      } else if (friendStatus.status === 'PENDING_RECEIVED') {
        await friendshipService.acceptFriendRequest(targetUserId);
        setFriendStatus({ status: 'FRIENDS' });
      } else if (friendStatus.status === 'FRIENDS') {
        setUnfriendConfirm({ show: true, userId: targetUserId, name: profileData?.fullName || 'Người này' });
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Có lỗi xảy ra');
    }
  };

  // Basic info handlers
  const handleChange =
    (field: keyof ProfileFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setErrorMessage('');
      setSuccessMessage('');
      setFormData((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      if (result) {
        setErrorMessage('');
        setSuccessMessage('');
        setFormData((current) => ({
          ...current,
          avatarUrl: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Cancellations
  const handleCancelBasic = () => setConfirmAction({ type: 'cancel', section: 'basic' });
  const handleCancelSports = () => setConfirmAction({ type: 'cancel', section: 'sports' });
  const handleCancelAvailability = () => setConfirmAction({ type: 'cancel', section: 'availability' });

  // Execute Confirmation Action
  const executeConfirmAction = () => {
    if (!confirmAction) return;
    const { type, section } = confirmAction;
    
    if (type === 'cancel') {
      if (section === 'basic') {
        setIsEditingBasic(false);
        if (displayedUser) {
          setFormData({
            fullName: displayedUser.fullName ?? '',
            avatarUrl: displayedUser.avatarUrl ?? '',
            bio: displayedUser.bio ?? '',
            district: displayedUser.district ?? '',
            lat: toInputValue(displayedUser.lat),
            lng: toInputValue(displayedUser.lng),
          });
        }
      } else if (section === 'sports') {
        setIsEditingSports(false);
        setSportCards(displayedUser?.sports && displayedUser.sports.length > 0 ? displayedUser.sports : SPORT_CARDS);
      } else if (section === 'availability') {
        setIsEditingAvailability(false);
        setAvailabilitySlots(displayedUser?.availability && displayedUser.availability.length > 0 ? displayedUser.availability : DEFAULT_WEEK_SLOTS);
      }
      setConfirmAction(null);
    } else if (type === 'save') {
      setConfirmAction(null);
      handlePartialSave(section);
    }
  };

  // Availability handlers
  const toggleAvailability = (dayLabel: string, period: 'morning' | 'afternoon' | 'evening') => {
    setAvailabilitySlots((current) =>
      current.map((slot) => {
        if (slot.label !== dayLabel) return slot;
        return {
          ...slot,
          [period]: slot[period] === 'Rảnh' ? 'Bận' : 'Rảnh',
        };
      }),
    );
  };

  // Sports handlers
  const addSportCard = () => {
    setSportCards((current) => [
      ...current,
      {
        name: 'Môn mới',
        tag: 'Tập thêm',
        level: 'Mới',
        note: '',
      },
    ]);
  };

  const removeSportCard = (index: number) => {
    setSportCards((current) => current.filter((_, sportIndex) => sportIndex !== index));
  };

  const updateSportCard = (index: number, field: keyof SportCard, value: string) => {
    setSportCards((current) =>
      current.map((sport, sportIndex) => (sportIndex === index ? { ...sport, [field]: value } : sport)),
    );
  };

  const sportEditorTips = ['Tag: Yêu thích / Main sport / Tập thêm', 'Mức độ: Mới / Trung bình / Tốt', 'Bấm + để thêm môn mới'];

  // Global Partial Submit Handler
  const handlePartialSave = async (section: 'basic' | 'sports' | 'availability') => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        fullName: (section === 'basic' ? formData.fullName : (currentUser?.fullName || '')).trim(),
        avatarUrl: (section === 'basic' ? formData.avatarUrl : (currentUser?.avatarUrl || '')).trim() || null,
        bio: (section === 'basic' ? formData.bio : (currentUser?.bio || '')).trim() || null,
        district: (section === 'basic' ? formData.district : (currentUser?.district || '')).trim() || null,
        lat: section === 'basic' 
          ? (formData.lat.trim() ? Number(formData.lat) : null) 
          : (currentUser?.lat ?? null),
        lng: section === 'basic' 
          ? (formData.lng.trim() ? Number(formData.lng) : null) 
          : (currentUser?.lng ?? null),
        sports: section === 'sports' ? sportCards : (currentUser?.sports || []),
        availability: section === 'availability' ? availabilitySlots : (currentUser?.availability || DEFAULT_WEEK_SLOTS),
      };

      const updatedProfile = await authService.updateProfile(payload);
      login(updatedProfile);
      
      if (section === 'basic') setIsEditingBasic(false);
      if (section === 'sports') setIsEditingSports(false);
      if (section === 'availability') setIsEditingAvailability(false);
      
      setSuccessMessage('Lưu thành công!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Lưu thất bại. Vui lòng thử lại.';
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page profile-clean-page">
      <LoggedInNavbar />

      <main className="profile-main-area">
        {isProfileLoading || !profileData ? (
          <ProfilePageSkeleton />
        ) : (
          <div className="container profile-container">
            <div className="profile-grid-layout">
            
            {/* LEFT SIDEBAR */}
            <div className="profile-sidebar-stack">
              <aside className="profile-sidecard profile-sidecard-sticky card-shell">
                <div className="profile-side-cover" />
                <div className="profile-side-body">
                  <div className="profile-side-avatar">
                    {profileData?.avatarUrl ? <img src={profileData.avatarUrl} alt={profileData.fullName} /> : <span>{profileInitial}</span>}
                  </div>

                  <div className="profile-side-name">{profileData?.fullName || 'Unknown user'}</div>
                  
                  {/* BADGES RENDER HERE */}
                  {profileData?.badges && profileData.badges.length > 0 && (
                    <div className="profile-side-badges mt-2 mb-1 d-flex flex-wrap justify-content-center gap-1">
                      {profileData.badges.map((badge: string) => (
                        <span key={badge} className={`badge rounded-pill fw-normal ${badge === 'Tân binh' ? 'bg-secondary' : badge === 'Tích cực' ? 'bg-info' : badge === 'Thân thiện' ? 'bg-success' : badge === 'Cảnh báo uy tín' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '11px' }}>
                          {badge === 'Cảnh báo uy tín' && <i className="fa-solid fa-triangle-exclamation me-1"></i>}
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="profile-side-sub mt-2">
                    <i className="fa-solid fa-location-dot me-2" />
                    {profileData?.district || 'Chưa cập nhật'}
                  </div>

                  <div className="profile-side-bio">
                    {profileData?.bio || 'Tạo hồ sơ thật gọn, rõ và dễ nhìn để những người khác nắm được phong cách chơi của bạn.'}
                  </div>

                  <div className="profile-side-actions">
                    {isOwnProfile ? (
                      <button
                        type="button"
                        className="btn btn-primary profile-main-btn w-100"
                        onClick={() => setIsEditingBasic(true)}
                      >
                        <i className="fa-regular fa-pen-to-square me-2" />
                        Chỉnh sửa thông tin cơ bản
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={`btn w-100 mb-2 ${
                            friendStatus.status === 'NONE' ? 'btn-primary' :
                            friendStatus.status === 'PENDING_SENT' ? 'btn-outline-warning' :
                            friendStatus.status === 'PENDING_RECEIVED' ? 'btn-success' : 'btn-dark'
                          }`}
                          onClick={handleFriendAction}
                        >
                          {friendStatus.status === 'NONE' && <><i className="fa-solid fa-user-plus me-2" />Kết bạn</>}
                          {friendStatus.status === 'PENDING_SENT' && <><i className="fa-solid fa-clock me-2" />Hủy yêu cầu</>}
                          {friendStatus.status === 'PENDING_RECEIVED' && <><i className="fa-solid fa-check me-2" />Chấp nhận kết bạn</>}
                          {friendStatus.status === 'FRIENDS' && <><i className="fa-solid fa-user-check me-2" />Hủy kết bạn</>}
                        </button>
                        {friendStatus.status === 'PENDING_RECEIVED' && (
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100 mb-2"
                            onClick={async () => {
                               if (!targetUserId) return;
                               await friendshipService.rejectFriendRequest(targetUserId);
                               setFriendStatus({ status: 'NONE' });
                            }}
                          >
                            <i className="fa-solid fa-xmark me-2" />Từ chối
                          </button>
                        )}
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary profile-secondary-btn w-100"
                          onClick={() => navigate('/messages')}
                        >
                          <i className="fa-regular fa-paper-plane me-2" />
                          Nhắn tin
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </aside>

              <aside className="profile-sidecard card-shell profile-community-card">
                <div className="profile-card-header compact">
                  <div>
                    <h2 className="profile-card-title">Chỉ số cộng đồng</h2>
                  </div>
                  <div className="profile-rating-pill">
                    <i className="fa-solid fa-star me-1" />
                    {combinedRating}
                  </div>
                </div>
                <div className="community-metrics-grid">
                  <div className="community-metric-card community-metric-accent">
                    <span>Số trận tham gia</span>
                    <strong>{matchCountText}</strong>
                  </div>
                  <div className="community-metric-card community-metric-soft">
                    <span>Thành viên từ</span>
                    <strong>{memberSince}</strong>
                  </div>
                </div>
              </aside>
            </div>

            {/* MAIN CONTENT COLUMN */}
            <section className="profile-main-column">
              <div className="profile-tabs mb-4 border-bottom d-flex gap-4">
                <div 
                  className={`profile-tab-item pb-2 ${activeTab === 'info' ? 'active fw-bold border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveTab('info')}
                >
                  Thông tin
                </div>
                {(!isOtherUser || friendStatus.status === 'FRIENDS') && (
                  <div 
                    className={`profile-tab-item pb-2 ${activeTab === 'friends' ? 'active fw-bold border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab('friends')}
                  >
                    Bạn bè ({friendsList.length})
                  </div>
                )}
                {!isOtherUser && (
                  <div 
                    className={`profile-tab-item pb-2 ${activeTab === 'requests' ? 'active fw-bold border-bottom border-primary border-3 text-primary' : 'text-muted'}`}
                    style={{ cursor: 'pointer', position: 'relative' }}
                    onClick={() => setActiveTab('requests')}
                  >
                    Lời mời kết bạn
                    {pendingRequests.length > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        {pendingRequests.length}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {activeTab === 'info' && (
                <>
                  <div className="profile-dual-grid">
                
                {/* SPORT CARDS SECTION */}
                <div className="profile-card card-shell">
                  <div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Phong cách chơi</h2>
                    </div>
                    {!isEditingSports && isOwnProfile && (
                      <button className="btn btn-sm btn-light text-primary border-0 fw-semibold" onClick={() => setIsEditingSports(true)}>
                        <i className="fa-regular fa-pen-to-square me-1" /> Sửa
                      </button>
                    )}
                  </div>
                  
                  {isEditingSports ? (
                    <div className="profile-editor-section-body mt-3">
                      <div className="profile-sport-tip-row mb-3">
                        {sportEditorTips.map((tip) => (
                          <span className="profile-sport-tip" key={tip}>{tip}</span>
                        ))}
                      </div>
                      <div className="sports-grid profile-sport-editor-grid">
                        {sportCards.map((sport, index) => (
                          <div className="sport-card profile-sport-editor-card" key={index}>
                            <div className="profile-sport-card-head">
                              <span className="profile-sport-card-index">#{index + 1}</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger profile-sport-remove-btn"
                                onClick={() => removeSportCard(index)}
                                disabled={sportCards.length === 1}
                              >
                                Xóa
                              </button>
                            </div>
                            <div className="profile-editor-field">
                              <label className="form-label fw-semibold">Tên môn</label>
                              <input
                                className="form-control profile-input profile-mini-input"
                                value={sport.name}
                                onChange={(event) => updateSportCard(index, 'name', event.target.value)}
                                placeholder="Tên môn"
                              />
                            </div>
                            <div className="profile-editor-field">
                              <label className="form-label fw-semibold">Thẻ</label>
                              <div className="profile-sport-tag-group">
                                {SPORT_TAG_OPTIONS.map((tagOption) => (
                                  <button
                                    key={tagOption}
                                    type="button"
                                    className={`profile-sport-tag-chip ${sport.tag === tagOption ? 'active' : ''}`}
                                    onClick={() => updateSportCard(index, 'tag', tagOption)}
                                  >
                                    {tagOption}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="profile-editor-field">
                              <label className="form-label fw-semibold">Mức độ</label>
                              <input
                                className="form-control profile-input profile-mini-input"
                                value={sport.level}
                                onChange={(event) => updateSportCard(index, 'level', event.target.value)}
                                placeholder="Mới / Trung bình / Tốt"
                              />
                            </div>
                            <div className="profile-editor-field profile-editor-field-wide">
                              <label className="form-label fw-semibold">Mô tả ngắn</label>
                              <textarea
                                className="form-control profile-input profile-textarea profile-sport-note"
                                rows={2}
                                value={sport.note}
                                onChange={(event) => updateSportCard(index, 'note', event.target.value)}
                                placeholder="Mô tả ngắn về phong cách chơi"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 d-flex justify-content-start">
                        <button type="button" className="btn btn-sm btn-outline-primary profile-add-sport-btn" onClick={addSportCard}>
                          <i className="fa-solid fa-plus me-1" /> Thêm môn thể thao
                        </button>
                      </div>
                      <div className="d-flex justify-content-end mt-4 gap-2 border-top pt-3">
                         <button className="btn btn-outline-secondary px-4" type="button" onClick={handleCancelSports}>Hủy</button>
                         <button className="btn btn-primary px-4" type="button" onClick={() => setConfirmAction({ type: 'save', section: 'sports' })} disabled={isSaving}>
                           {isSaving ? 'Đang lưu...' : 'Lưu'}
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="sports-grid mt-2">
                      {sportCards.map((sport, index) => (
                        <article className="sport-card" key={index}>
                          <div className="sport-card-top">
                            <span className="sport-tag">{sport.tag}</span>
                            <span className="sport-level">{sport.level}</span>
                          </div>
                          <h3>{sport.name}</h3>
                          <p>{sport.note}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {/* AVAILABILITY SECTION */}
                <div className="profile-card card-shell">
                  <div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Thời gian ghép trận</h2>
                    </div>
                    {!isEditingAvailability && isOwnProfile && (
                      <button className="btn btn-sm btn-light text-primary border-0 fw-semibold" onClick={() => setIsEditingAvailability(true)}>
                        <i className="fa-regular fa-pen-to-square me-1" /> Sửa
                      </button>
                    )}
                  </div>
                  
                  {isEditingAvailability ? (
                     <div className="profile-editor-section-body mt-3">
                       <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>Bấm vào ô để đổi Rảnh / Bận.</p>
                       <div className="schedule-table-wrap profile-schedule-editor-wrap">
                          <div className="schedule-grid schedule-head">
                            <span>Buổi</span>
                            <span>T2</span>
                            <span>T3</span>
                            <span>T4</span>
                            <span>T5</span>
                            <span>T6</span>
                            <span>T7</span>
                            <span>CN</span>
                          </div>
                          {(['Sáng', 'Chiều', 'Tối'] as const).map((slot) => (
                            <div className="schedule-grid" key={slot}>
                              <span className="schedule-row-label">{slot}</span>
                              {availabilitySlots.map((day) => {
                                const period = slot === 'Sáng' ? 'morning' : slot === 'Chiều' ? 'afternoon' : 'evening';
                                const status = day[period];
                                return (
                                  <button
                                    key={`${slot}-${day.label}`}
                                    type="button"
                                    className={`schedule-cell schedule-toggle ${status === 'Rảnh' ? 'free' : 'busy'}`}
                                    onClick={() => toggleAvailability(day.label, period)}
                                  >
                                    {status}
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                       </div>
                       <div className="d-flex justify-content-end mt-4 gap-2 border-top pt-3">
                         <button className="btn btn-outline-secondary px-4" type="button" onClick={handleCancelAvailability}>Hủy</button>
                         <button className="btn btn-primary px-4" type="button" onClick={() => setConfirmAction({ type: 'save', section: 'availability' })} disabled={isSaving}>
                           {isSaving ? 'Đang lưu...' : 'Lưu'}
                         </button>
                       </div>
                     </div>
                  ) : (
                     <div className="schedule-table-wrap mt-2">
                        <div className="schedule-grid schedule-head">
                          <span>Buổi</span>
                          <span>T2</span>
                          <span>T3</span>
                          <span>T4</span>
                          <span>T5</span>
                          <span>T6</span>
                          <span>T7</span>
                          <span>CN</span>
                        </div>
                        {(['Sáng', 'Chiều', 'Tối'] as const).map((slot) => (
                          <div className="schedule-grid" key={slot}>
                            <span className="schedule-row-label">{slot}</span>
                            {availabilitySlots.map((day, idx) => {
                              const status = day[slot === 'Sáng' ? 'morning' : slot === 'Chiều' ? 'afternoon' : 'evening'];
                              return (
                                <span key={idx} className={`schedule-cell ${status === 'Rảnh' ? 'free' : 'busy'}`}>
                                  {status}
                                </span>
                              );
                            })}
                          </div>
                        ))}
                     </div>
                  )}
                </div>
              </div>

              {/* REVIEWS SECTION */}
              <div className="profile-card card-shell mt-4">
                <div className="profile-card-header compact">
                  <div>
                    <h2 className="profile-card-title">Nhận xét từ cộng đồng</h2>
                  </div>
                </div>

                <div className="review-list">
                  {isReviewsLoading ? (
                    <div>
                      <ReviewCardSkeleton />
                      <ReviewCardSkeleton />
                    </div>
                  ) : reviews.length > 0 ? reviews.map((review, index) => (
                    <article className="review-card-new" key={index}>
                      <div className="review-card-header">
                        <div className="review-avatar">
                          {review.reviewerAvatarUrl ? (
                            <img src={review.reviewerAvatarUrl} alt={review.reviewerName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            review.reviewerName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="review-name-new">{review.reviewerName}</div>
                          <div className="review-meta-new">
                            {review.matchSport} • {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <i key={i} className={`fa-star ${i < review.ratingScore ? 'fa-solid' : 'fa-regular'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="review-message">{review.comment}</p>
                    </article>
                  )) : (
                    <p className="text-muted fst-italic">Chưa có nhận xét nào.</p>
                  )}
                </div>
              </div>
              </>
              )}

              {activeTab === 'friends' && (
                <div className="profile-card card-shell p-4">
                  <h3 className="mb-4">Danh sách bạn bè</h3>
                  {friendsList.length === 0 ? (
                    <p className="text-muted text-center py-5">Chưa có bạn bè nào.</p>
                  ) : (
                    <div className="row g-3">
                      {friendsList.map(friend => (
                        <div className="col-12 col-md-6" key={friend.userId}>
                          <div className="d-flex align-items-center p-3 border rounded shadow-sm">
                            <img src={friend.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.fullName)}&background=eff6ff&color=2563eb`} alt={friend.fullName} className="rounded-circle me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            <div className="flex-grow-1">
                              <Link to={`/profile/${friend.userId}`} className="text-decoration-none fw-bold text-dark">{friend.fullName}</Link>
                              <div className="d-flex gap-1 mt-1">
                                {friend.badges?.map(b => <span key={b} className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>{b}</span>)}
                              </div>
                            </div>
                            {!isOtherUser && (
                              <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => {
                                setUnfriendConfirm({ show: true, userId: friend.userId, name: friend.fullName });
                              }}>
                                Hủy kết bạn
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && !isOtherUser && (
                <div className="profile-card card-shell p-4">
                  <h3 className="mb-4">Lời mời kết bạn</h3>
                  {pendingRequests.length === 0 ? (
                    <p className="text-muted text-center py-5">Không có lời mời nào.</p>
                  ) : (
                    <div className="row g-3">
                      {pendingRequests.map(req => (
                        <div className="col-12 col-md-6" key={req.userId}>
                          <div className="d-flex align-items-center p-3 border rounded shadow-sm">
                            <img src={req.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.fullName)}&background=eff6ff&color=2563eb`} alt={req.fullName} className="rounded-circle me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            <div className="flex-grow-1">
                              <Link to={`/profile/${req.userId}`} className="text-decoration-none fw-bold text-dark">{req.fullName}</Link>
                            </div>
                            <div className="d-flex gap-2 ms-2">
                              <button className="btn btn-sm btn-success" onClick={async () => {
                                await friendshipService.acceptFriendRequest(req.userId);
                                setPendingRequests(prev => prev.filter(r => r.userId !== req.userId));
                                setFriendsList(prev => [...prev, { ...req, status: 'ACCEPTED' }]);
                              }}>Chấp nhận</button>
                              <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                                await friendshipService.rejectFriendRequest(req.userId);
                                setPendingRequests(prev => prev.filter(r => r.userId !== req.userId));
                              }}>Từ chối</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </section>
            </div>
          </div>
        )}
      </main>

      {/* BASIC INFO EDITOR MODAL */}
      {isEditingBasic && (
        <div className="profile-editor-backdrop" role="presentation" onClick={handleCancelBasic}>
          <main className="profile-editor-page" aria-label="Chỉnh sửa hồ sơ" ref={editorRef} onClick={(event) => event.stopPropagation()}>
            <div className="profile-editor-shell card-shell">
              <div className="profile-editor-topbar">
                <button
                  type="button"
                  className="profile-editor-close"
                  onClick={handleCancelBasic}
                  aria-label="Đóng"
                >
                  ×
                </button>
                <h2 className="profile-editor-title profile-editor-title-center">Thiết lập hồ sơ của bạn</h2>
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    className="btn btn-outline-secondary profile-editor-save"
                    type="button"
                    onClick={handleCancelBasic}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary profile-editor-save"
                    type="button"
                    disabled={isSaving}
                    onClick={() => setConfirmAction({ type: 'save', section: 'basic' })}
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>

              <div className="profile-editor-summary-row">
                <div className="profile-editor-summary-item">
                  <span className="profile-editor-summary-label">Tên hiển thị</span>
                  <strong>{currentUser?.fullName || 'Chưa cập nhật'}</strong>
                </div>
                <div className="profile-editor-summary-item">
                  <span className="profile-editor-summary-label">Khu vực</span>
                  <strong>{currentUser?.district || 'Chưa cập nhật'}</strong>
                </div>
                <div className="profile-editor-summary-item">
                  <span className="profile-editor-summary-label">Thành viên từ</span>
                  <strong>{memberSince}</strong>
                </div>
              </div>

              <div className="profile-edit-banner profile-edit-banner-compact" role="status">
                <i className="fa-solid fa-pen-to-square me-2" />
                Bạn đang ở chế độ chỉnh sửa Thông tin cơ bản. Hãy cập nhật rồi bấm lưu.
              </div>

              <section className="profile-editor-section card-shell" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="profile-editor-section-header">
                  <div>
                    <h3 className="profile-editor-section-title">Thông tin cơ bản</h3>
                    <p className="profile-editor-section-subtitle">Cập nhật thông tin cá nhân, ảnh đại diện và giới thiệu ngắn.</p>
                  </div>
                </div>

                <div className="profile-editor-section-body">
                  <div className="profile-editor-field">
                    <label className="form-label fw-semibold">Họ và tên</label>
                    <input
                      className="form-control profile-input"
                      value={formData.fullName}
                      onChange={handleChange('fullName')}
                      placeholder="Nguyễn Văn A"
                      maxLength={100}
                    />
                  </div>

                  <div className="profile-editor-field">
                    <label className="form-label fw-semibold">Quận / khu vực</label>
                    <input
                      className="form-control profile-input"
                      value={formData.district}
                      onChange={handleChange('district')}
                      placeholder="Quận 7, TP. Hồ Chí Minh"
                      maxLength={60}
                    />
                  </div>

                  <div className="profile-editor-field">
                    <label className="form-label fw-semibold">Avatar</label>
                    <div className="profile-avatar-switcher mb-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${avatarMode === 'upload' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                        onClick={() => setAvatarMode('upload')}
                      >
                        Tải ảnh từ máy
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${avatarMode === 'url' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setAvatarMode('url')}
                      >
                        Dán URL ảnh
                      </button>
                    </div>

                    {avatarMode === 'upload' ? (
                      <div className="profile-upload-box">
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {formData.avatarUrl && (
                          <div className="profile-upload-preview mt-2">
                            <img src={formData.avatarUrl} alt="Avatar preview" style={{ maxWidth: '100px', borderRadius: '50%' }} />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mt-2 ms-3"
                              onClick={() =>
                                setFormData((current) => ({
                                  ...current,
                                  avatarUrl: '',
                                }))
                              }
                            >
                              Xóa ảnh
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        className="form-control profile-input"
                        value={formData.avatarUrl}
                        onChange={handleChange('avatarUrl')}
                        placeholder="https://..."
                        maxLength={200}
                      />
                    )}
                  </div>

                  <div className="profile-editor-field profile-editor-field-wide">
                    <label className="form-label fw-semibold">Giới thiệu</label>
                    <textarea
                      className="form-control profile-input profile-textarea"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange('bio')}
                      placeholder="Đam mê bóng đá và cầu lông. Tìm team để ghép trận hữu ích vào cuối tuần."
                    />
                  </div>
                </div>
              </section>
              
              {errorMessage && (
                <div className="alert alert-danger mx-4 mb-3 profile-alert">{errorMessage}</div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmAction && (
        <div className="profile-modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="card-shell p-4" style={{ width: '100%', maxWidth: '400px', background: '#fff' }}>
             <h4 className="mb-3">Xác nhận</h4>
             <p className="text-muted mb-4">
               {confirmAction.type === 'cancel' 
                 ? 'Bạn có chắc chắn muốn hủy? Mọi thay đổi chưa lưu sẽ bị mất.' 
                 : 'Bạn có chắc chắn muốn lưu các thay đổi này không?'}
             </p>
             <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setConfirmAction(null)}>Quay lại</button>
                <button 
                  className={`btn ${confirmAction.type === 'cancel' ? 'btn-danger' : 'btn-primary'}`} 
                  onClick={executeConfirmAction}
                >
                   {confirmAction.type === 'cancel' ? 'Đồng ý hủy' : 'Đồng ý lưu'}
                </button>
             </div>
          </div>
        </div>
      )}

      <Footer />

      {successMessage && (
        <div className="profile-toast profile-toast-success" role="status">
          {successMessage}
        </div>
      )}

      {/* UNFRIEND CONFIRM MODAL */}
      {unfriendConfirm.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Xác nhận hủy kết bạn</h5>
                <button type="button" className="btn-close" onClick={() => setUnfriendConfirm({ show: false, userId: null, name: '' })}></button>
              </div>
              <div className="modal-body text-center py-4">
                <p className="mb-0">Bạn có chắc chắn muốn hủy kết bạn với <span className="fw-bold">{unfriendConfirm.name}</span>?</p>
              </div>
              <div className="modal-footer border-0 d-flex justify-content-center gap-2">
                <button type="button" className="btn btn-outline-secondary px-4 rounded-pill" onClick={() => setUnfriendConfirm({ show: false, userId: null, name: '' })}>Hủy</button>
                <button type="button" className="btn btn-danger px-4 rounded-pill" onClick={async () => {
                  if (unfriendConfirm.userId) {
                    try {
                      await friendshipService.unfriend(unfriendConfirm.userId);
                      if (isOtherUser && targetUserId === unfriendConfirm.userId) {
                        setFriendStatus({ status: 'NONE' });
                        setActiveTab('info');
                      } else {
                        setFriendsList(prev => prev.filter(f => f.userId !== unfriendConfirm.userId));
                      }
                      setUnfriendConfirm({ show: false, userId: null, name: '' });
                    } catch (e: any) {
                      setErrorMessage(e.message || 'Không thể hủy kết bạn');
                    }
                  }
                }}>Đồng ý</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
