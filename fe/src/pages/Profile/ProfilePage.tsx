import React, { useEffect, useRef, useState } from 'react';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import Footer from '../../components/Footer/Footer';
import { useAuth, type SportCard, type AvailabilitySlot } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { ratingService, type UserReviewDto } from '../../services/ratingService';
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
  const editorRef = useRef<HTMLElement | null>(null);
  
  // Independent Edit States
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingSports, setIsEditingSports] = useState(false);
  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  
  // Custom Confirmation Modal State
  const [confirmAction, setConfirmAction] = useState<{ type: 'cancel' | 'save'; section: 'basic' | 'sports' | 'availability' } | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('upload');
  
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>(DEFAULT_WEEK_SLOTS);
  const [sportCards, setSportCards] = useState<SportCard[]>(SPORT_CARDS);
  const [reviews, setReviews] = useState<UserReviewDto[]>([]);
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: '',
    avatarUrl: '',
    bio: '',
    district: '',
    lat: '',
    lng: '',
  });

  // Sync data from user
  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.fullName ?? '',
      avatarUrl: user.avatarUrl ?? '',
      bio: user.bio ?? '',
      district: user.district ?? '',
      lat: toInputValue(user.lat),
      lng: toInputValue(user.lng),
    });

    if (user.sports && user.sports.length > 0) {
      setSportCards(user.sports);
    }
    if (user.availability && user.availability.length > 0) {
      setAvailabilitySlots(user.availability);
    }

    // Fetch reviews
    ratingService.getUserReviews(user.id).then(setReviews).catch(console.error);
  }, [user]);

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

  const profileInitial = user?.fullName?.trim()?.charAt(0).toUpperCase() || 'U';
  
  // Calculate combined rating if both exist, or use whichever exists, or default to 0
  let combinedRating: number | string = 0;
  if (user?.avgAttitudeScore != null && user?.avgSkillScore != null) {
    combinedRating = ((user.avgAttitudeScore + user.avgSkillScore) / 2).toFixed(1);
  } else if (user?.avgAttitudeScore != null) {
    combinedRating = user.avgAttitudeScore.toFixed(1);
  } else if (user?.avgSkillScore != null) {
    combinedRating = user.avgSkillScore.toFixed(1);
  } else {
    combinedRating = 'Chưa có';
  }

  const memberSince = user?.createdAt ? formatMonthYear(user.createdAt) : '—';
  const matchCountText = user?.completedMatches ? `${user.completedMatches} trận` : '0 trận';

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
        if (user) {
          setFormData({
            fullName: user.fullName ?? '',
            avatarUrl: user.avatarUrl ?? '',
            bio: user.bio ?? '',
            district: user.district ?? '',
            lat: toInputValue(user.lat),
            lng: toInputValue(user.lng),
          });
        }
      } else if (section === 'sports') {
        setIsEditingSports(false);
        setSportCards(user?.sports && user.sports.length > 0 ? user.sports : SPORT_CARDS);
      } else if (section === 'availability') {
        setIsEditingAvailability(false);
        setAvailabilitySlots(user?.availability && user.availability.length > 0 ? user.availability : DEFAULT_WEEK_SLOTS);
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
        fullName: (section === 'basic' ? formData.fullName : (user?.fullName || '')).trim(),
        avatarUrl: (section === 'basic' ? formData.avatarUrl : (user?.avatarUrl || '')).trim() || null,
        bio: (section === 'basic' ? formData.bio : (user?.bio || '')).trim() || null,
        district: (section === 'basic' ? formData.district : (user?.district || '')).trim() || null,
        lat: section === 'basic' 
          ? (formData.lat.trim() ? Number(formData.lat) : null) 
          : (user?.lat ?? null),
        lng: section === 'basic' 
          ? (formData.lng.trim() ? Number(formData.lng) : null) 
          : (user?.lng ?? null),
        sports: section === 'sports' ? sportCards : (user?.sports || []),
        availability: section === 'availability' ? availabilitySlots : (user?.availability || DEFAULT_WEEK_SLOTS),
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
        <div className="container profile-container">
          <div className="profile-grid-layout">
            
            {/* LEFT SIDEBAR */}
            <div className="profile-sidebar-stack">
              <aside className="profile-sidecard profile-sidecard-sticky card-shell">
                <div className="profile-side-cover" />
                <div className="profile-side-body">
                  <div className="profile-side-avatar">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} /> : <span>{profileInitial}</span>}
                  </div>

                  <div className="profile-side-name">{user?.fullName || 'Unknown user'}</div>
                  
                  {/* BADGES RENDER HERE */}
                  {user?.badges && user.badges.length > 0 && (
                    <div className="profile-side-badges mt-2 mb-1 d-flex flex-wrap justify-content-center gap-1">
                      {user.badges.map(badge => (
                        <span key={badge} className={`badge rounded-pill fw-normal ${badge === 'Tân binh' ? 'bg-secondary' : badge === 'Tích cực' ? 'bg-info' : badge === 'Thân thiện' ? 'bg-success' : badge === 'Cảnh báo uy tín' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '11px' }}>
                          {badge === 'Cảnh báo uy tín' && <i className="fa-solid fa-triangle-exclamation me-1"></i>}
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="profile-side-sub mt-2">
                    <i className="fa-solid fa-location-dot me-2" />
                    {user?.district || 'Chưa cập nhật'}
                  </div>

                  <div className="profile-side-bio">
                    {user?.bio || 'Tạo hồ sơ thật gọn, rõ và dễ nhìn để những người khác nắm được phong cách chơi của bạn.'}
                  </div>

                  <div className="profile-side-actions">
                    <button
                      type="button"
                      className="btn btn-primary profile-main-btn w-100"
                      onClick={() => setIsEditingBasic(true)}
                    >
                      <i className="fa-regular fa-pen-to-square me-2" />
                      Chỉnh sửa thông tin cơ bản
                    </button>
                    <button type="button" className="btn btn-outline-secondary profile-secondary-btn w-100">
                      <i className="fa-regular fa-paper-plane me-2" />
                      Nhắn tin
                    </button>
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
              <div className="profile-dual-grid">
                
                {/* SPORT CARDS SECTION */}
                <div className="profile-card card-shell">
                  <div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Phong cách chơi</h2>
                    </div>
                    {!isEditingSports && (
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
                    {!isEditingAvailability && (
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
                  {reviews.length > 0 ? reviews.map((review, index) => (
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
            </section>
          </div>
        </div>
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
                  <strong>{user?.fullName || 'Chưa cập nhật'}</strong>
                </div>
                <div className="profile-editor-summary-item">
                  <span className="profile-editor-summary-label">Khu vực</span>
                  <strong>{user?.district || 'Chưa cập nhật'}</strong>
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
    </div>
  );
};

export default ProfilePage;
