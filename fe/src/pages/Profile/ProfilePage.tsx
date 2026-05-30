import React, { useEffect, useState } from 'react';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './ProfilePage.css';

type ProfileFormState = {
  fullName: string;
  avatarUrl: string;
  bio: string;
  district: string;
  lat: string;
  lng: string;
};

type ReviewItem = {
  name: string;
  title: string;
  timeAgo: string;
  message: string;
  rating: number;
};

type AvailabilityStatus = 'Rảnh' | 'Bận';

type DayAvailability = {
  label: string;
  morning: AvailabilityStatus;
  afternoon: AvailabilityStatus;
  evening: AvailabilityStatus;
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

const SPORT_CARDS = [
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

type SportCardState = (typeof SPORT_CARDS)[number];

const SPORT_TAG_OPTIONS = ['Yêu thích', 'Main sport', 'Tập thêm', 'Khác'] as const;

const DEFAULT_WEEK_SLOTS: DayAvailability[] = [
  { label: 'T2', morning: 'Rảnh', afternoon: 'Bận', evening: 'Rảnh' },
  { label: 'T3', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'T4', morning: 'Bận', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'T5', morning: 'Rảnh', afternoon: 'Bận', evening: 'Rảnh' },
  { label: 'T6', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'T7', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Rảnh' },
  { label: 'CN', morning: 'Rảnh', afternoon: 'Rảnh', evening: 'Bận' },
];

const REVIEWS: ReviewItem[] = [
  {
    name: 'Trần Hoàng',
    title: 'Đối tác trận bóng',
    timeAgo: '2 ngày trước',
    message: 'Giao lưu cùng bạn rất vui, vào sân đúng giờ và phối hợp tốt. Sẽ tiếp tục rủ Nam đá chung.',
    rating: 5,
  },
  {
    name: 'Duo P.',
    title: 'Badminton Doubles',
    timeAgo: '1 tuần trước',
    message: 'Chơi chắc tay, di chuyển ổn và tinh thần thi đấu rất tốt.',
    rating: 4,
  },
  {
    name: 'Khánh D.',
    title: 'City Football',
    timeAgo: '2 tuần trước',
    message: 'Tổ chức gọn gàng, nhịp trận ổn, rất dễ ghép đội.',
    rating: 5,
  },
];

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditBanner, setShowEditBanner] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('upload');
  const [availabilitySlots, setAvailabilitySlots] = useState<DayAvailability[]>(DEFAULT_WEEK_SLOTS);
  const [sportCards, setSportCards] = useState<SportCardState[]>(SPORT_CARDS);
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: '',
    avatarUrl: '',
    bio: '',
    district: '',
    lat: '',
    lng: '',
  });

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
  }, [user]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(''), 3500);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!showEditBanner) return;
    const timer = window.setTimeout(() => setShowEditBanner(false), 4500);
    return () => window.clearTimeout(timer);
  }, [showEditBanner]);

  const profileInitial = user?.fullName?.trim()?.charAt(0).toUpperCase() || 'U';
  const communityRating = '4.9 / 5';
  const communityRatingText = 'Đánh giá chung';
  const memberSince = user?.createdAt ? formatMonthYear(user.createdAt) : '—';

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

  const addSportCard = () => {
    setSportCards((current) => [
      ...current,
      {
        name: 'Môn mới',
        tag: 'Tập thêm',
        level: 'Mới',
        note: 'Mô tả ngắn về môn thể thao này.',
      },
    ]);
  };

  const removeSportCard = (index: number) => {
    setSportCards((current) => current.filter((_, sportIndex) => sportIndex !== index));
  };

  const sportEditorTips = ['Tag: Yêu thích / Main sport / Tập thêm', 'Mức độ: Mới / Trung bình / Tốt', 'Bấm + để thêm môn mới'];

  const updateSportCard = (index: number, field: keyof SportCardState, value: string) => {
    setSportCards((current) =>
      current.map((sport, sportIndex) => (sportIndex === index ? { ...sport, [field]: value } : sport)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        avatarUrl: formData.avatarUrl.trim() || null,
        bio: formData.bio.trim() || null,
        district: formData.district.trim() || null,
        lat: formData.lat.trim() ? Number(formData.lat) : null,
        lng: formData.lng.trim() ? Number(formData.lng) : null,
      };

      const updatedProfile = await authService.updateProfile(payload);
      login(updatedProfile);
      setIsEditing(false);
      setShowEditBanner(false);
      setSuccessMessage('Cập nhật profile thành công.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật profile.';
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
            <div className="profile-sidebar-stack">
              <aside className="profile-sidecard profile-sidecard-sticky card-shell">
                <div className="profile-side-cover" />
                <div className="profile-side-body">
                  <div className="profile-side-avatar">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.fullName} /> : <span>{profileInitial}</span>}
                  </div>

                  <div className="profile-side-name">{user?.fullName || 'Unknown user'}</div>
                  <div className="profile-side-sub">
                    <i className="fa-solid fa-location-dot me-2" />
                    {user?.district || 'Ho Chi Minh City, Vietnam'}
                  </div>

                  <div className="profile-side-bio">
                    {user?.bio || 'Tạo hồ sơ thật gọn, rõ và dễ nhìn để những người khác nắm được phong cách chơi của bạn.'}
                  </div>

                  <div className="profile-side-actions">
                    <button
                      type="button"
                      className="btn btn-primary profile-main-btn w-100"
                      onClick={() => {
                        setErrorMessage('');
                        setSuccessMessage('');
                        setIsEditing(true);
                        setShowEditBanner(true);
                      }}
                    >
                      <i className="fa-regular fa-pen-to-square me-2" />
                      Chỉnh sửa hồ sơ
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
                    {communityRating}
                  </div>
                </div>

                <div className="community-metrics-grid">
                  <div className="community-metric-card community-metric-accent">
                    <span>{communityRatingText}</span>
                    <strong>{communityRating}</strong>
                  </div>
                  <div className="community-metric-card community-metric-soft">
                    <span>Thành viên từ</span>
                    <strong>{memberSince}</strong>
                  </div>
                </div>
              </aside>
            </div>

            <section className="profile-main-column">
              <div className="profile-dual-grid">
                <div className="profile-card card-shell">
                  <div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Phong cách chơi</h2>
                    </div>
                  </div>
                  <div className="sports-grid">
                    {sportCards.map((sport) => (
                      <article className="sport-card" key={sport.name}>
                        <div className="sport-card-top">
                          <span className="sport-tag">{sport.tag}</span>
                          <span className="sport-level">{sport.level}</span>
                        </div>
                        <h3>{sport.name}</h3>
                        <p>{sport.note}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="profile-card card-shell">
                  <div className="profile-card-header compact">
                    <div>
                      <h2 className="profile-card-title">Thời gian có thể ghép trận</h2>
                    </div>
                  </div>
                  <div className="schedule-table-wrap">
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
                          const status = day[slot === 'Sáng' ? 'morning' : slot === 'Chiều' ? 'afternoon' : 'evening'];
                          return (
                            <span key={`${slot}-${day.label}`} className={`schedule-cell ${status === 'Rảnh' ? 'free' : 'busy'}`}>
                              {status}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="profile-card card-shell mt-4">
                <div className="profile-card-header compact">
                  <div>
                    <h2 className="profile-card-title">Nhận xét từ cộng đồng</h2>
                  </div>
                </div>

                <div className="review-list">
                  {REVIEWS.map((review) => (
                    <article className="review-card-new" key={review.name}>
                      <div className="review-card-header">
                        <div className="review-avatar">{review.name.charAt(0)}</div>
                        <div>
                          <div className="review-name-new">{review.name}</div>
                          <div className="review-meta-new">
                            {review.title} • {review.timeAgo}
                          </div>
                        </div>
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <i key={index} className={`fa-star ${index < review.rating ? 'fa-solid' : 'fa-regular'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="review-message">{review.message}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {isEditing && (
        <div
          className="profile-modal-backdrop"
          role="presentation"
          onClick={() => {
            setIsEditing(false);
            setShowEditBanner(false);
          }}
        >
          <div
            className="profile-modal-shell"
            role="dialog"
            aria-modal="true"
            aria-label="Chỉnh sửa hồ sơ"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="profile-modal-header">
              <div>
                <h2 className="profile-card-title">Thiết lập hồ sơ của bạn</h2>
              </div>
              <button
                type="button"
                className="profile-modal-close"
                onClick={() => {
                  setIsEditing(false);
                  setShowEditBanner(false);
                }}
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {showEditBanner && (
              <div className="profile-edit-banner" role="status">
                <i className="fa-solid fa-pen-to-square me-2" />
                Bạn đang ở chế độ chỉnh sửa. Hãy cập nhật thông tin rồi bấm lưu.
              </div>
            )}

            <form className="profile-edit-form" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Họ và tên</label>
                  <input
                    className="form-control profile-input"
                    value={formData.fullName}
                    onChange={handleChange('fullName')}
                    placeholder="Nhập họ và tên"
                    maxLength={100}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Quận / khu vực</label>
                  <input
                    className="form-control profile-input"
                    value={formData.district}
                    onChange={handleChange('district')}
                    placeholder="Quận 7, TP. Hồ Chí Minh"
                    maxLength={60}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Avatar</label>
                  <div className="profile-avatar-switcher">
                    <button
                      type="button"
                      className={`btn btn-sm ${avatarMode === 'upload' ? 'btn-primary' : 'btn-outline-secondary'}`}
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
                        <div className="profile-upload-preview">
                          <img src={formData.avatarUrl} alt="Avatar preview" />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
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

                <div className="col-12">
                  <label className="form-label fw-semibold">Giới thiệu</label>
                  <textarea
                    className="form-control profile-input profile-textarea"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange('bio')}
                    placeholder="Nói ngắn gọn về bản thân, môn thể thao yêu thích, và kiểu trận bạn thích tham gia."
                  />
                </div>

                <div className="col-12">
                  <div className="profile-sport-editor">
                    <div className="profile-sport-editor-head">
                      <label className="form-label fw-semibold mb-0">Phong cách chơi</label>
                      <span className="profile-sport-editor-hint">Chỉnh nội dung thẻ bên dưới</span>
                    </div>

                    <div className="profile-sport-tip-row">
                      {sportEditorTips.map((tip) => (
                        <span className="profile-sport-tip" key={tip}>
                          {tip}
                        </span>
                      ))}
                    </div>

                    <div className="sports-grid profile-sport-editor-grid">
                      {sportCards.map((sport, index) => (
                        <div className="sport-card profile-sport-editor-card" key={`${sport.name}-${index}`}>
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
                          <div className="row g-2">
                            <div className="col-12">
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
                            <div className="col-12">
                              <input
                                className="form-control profile-input profile-mini-input"
                                value={sport.level}
                                onChange={(event) => updateSportCard(index, 'level', event.target.value)}
                                placeholder="Mức độ"
                              />
                            </div>
                            <div className="col-12">
                              <input
                                className="form-control profile-input profile-mini-input"
                                value={sport.name}
                                onChange={(event) => updateSportCard(index, 'name', event.target.value)}
                                placeholder="Tên môn"
                              />
                            </div>
                            <div className="col-12">
                              <textarea
                                className="form-control profile-input profile-textarea profile-sport-note"
                                rows={3}
                                value={sport.note}
                                onChange={(event) => updateSportCard(index, 'note', event.target.value)}
                                placeholder="Mô tả ngắn"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 d-flex justify-content-end">
                      <button type="button" className="btn btn-outline-primary profile-add-sport-btn" onClick={addSportCard}>
                        <i className="fa-solid fa-plus me-2" />
                        Thêm môn thể thao
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="profile-schedule-editor">
                    <div className="profile-schedule-editor-head">
                      <label className="form-label fw-semibold mb-0">Thời gian có thể ghép trận</label>
                      <span className="profile-schedule-editor-hint">Bấm vào ô để đổi Rảnh / Bận</span>
                    </div>

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
                  </div>
                </div>

                {errorMessage && (
                  <div className="col-12">
                    <div className="alert alert-danger mb-0 profile-alert">{errorMessage}</div>
                  </div>
                )}

                {successMessage && (
                  <div className="col-12">
                    <div className="alert alert-success mb-0 profile-alert">{successMessage}</div>
                  </div>
                )}

                <div className="col-12 d-flex flex-wrap gap-2 pt-1">
                  <button className="btn btn-primary profile-main-btn" type="submit" disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button
                    className="btn btn-outline-secondary profile-secondary-btn"
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setShowEditBanner(false);
                      setSuccessMessage('');
                      setErrorMessage('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </form>
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
