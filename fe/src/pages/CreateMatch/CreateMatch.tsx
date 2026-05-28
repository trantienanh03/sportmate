import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInNavbar from '../../components/LoggedInNavbar/LoggedInNavbar';
import { matchService } from '../../services/matchService';
import './CreateMatch.css';

import footballIcon from '../../assets/ion--football.svg';
import badmintonIcon from '../../assets/mdi--badminton.svg';
import tennisIcon from '../../assets/emojione--tennis.svg';
import pickleballIcon from '../../assets/material-symbols--pickleball.svg';
import basketballIcon from '../../assets/emojione--basketball.svg';
import tableTennisIcon from '../../assets/uil--table-tennis.svg';
import esportsIcon from '../../assets/material-symbols--sports-esports.svg';
import volleyballIcon from '../../assets/mdi--volleyball.svg';

const SPORTS = [
  { id: 'football', label: 'Bóng đá', icon: footballIcon },
  { id: 'badminton', label: 'Cầu lông', icon: badmintonIcon },
  { id: 'tennis', label: 'Tennis', icon: tennisIcon },
  { id: 'pickleball', label: 'Pickleball', icon: pickleballIcon },
  { id: 'basketball', label: 'Bóng rổ', icon: basketballIcon },
  { id: 'tabletennis', label: 'Bóng bàn', icon: tableTennisIcon },
  { id: 'esports', label: 'Thể thao điện tử', icon: esportsIcon },
  { id: 'volleyball', label: 'Bóng chuyền', icon: volleyballIcon },
];

const SKILL_LEVELS = [
  { id: 'newbie', label: 'Mới tập chơi' },
  { id: 'beginner', label: 'Cơ bản' },
  { id: 'intermediate', label: 'Trung bình' },
  { id: 'advanced', label: 'Nâng cao' },
  { id: 'all', label: 'Mọi trình độ' },
];

const TIPS = [
  {
    title: 'Chọn môn thể thao',
    body: 'Chọn môn thể thao bạn muốn chơi. Việc này giúp những người cùng sở thích tìm thấy trận đấu của bạn nhanh hơn.',
  },
  {
    title: 'Lên lịch phù hợp',
    body: 'Các buổi tối ngày thường (18h - 21h) hoặc sáng cuối tuần là thời điểm vàng. Hãy chọn khung giờ có nhiều người rảnh.',
  },
  {
    title: 'Sắp hoàn tất!',
    body: 'Hãy đặt tiêu đề ngắn gọn và rõ ràng. Mô tả chi tiết sẽ giúp những người chơi khác biết trước trận đấu diễn ra thế nào.',
  },
];

const MOCK_VENUES = [
  { id: 1, name: 'Sân Cầu Lông Phú Nhuận', address: '123 Phan Xích Long, Phú Nhuận, HCM', sport: 'badminton', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?w=100&h=100&fit=crop' },
  { id: 2, name: 'Amber Pickleball Club', address: '326 Võ Văn Kiệt, Quận 1, HCM', sport: 'pickleball', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?w=100&h=100&fit=crop' },
  { id: 3, name: 'Sân Bóng Đá Chảo Lửa', address: '30 Phan Thúc Duyện, Tân Bình, HCM', sport: 'football', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?w=100&h=100&fit=crop' },
  { id: 4, name: 'Sân Cầu Lông Viettel', address: 'Hẻm 285 CMT8, Quận 10, HCM', sport: 'badminton', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?w=100&h=100&fit=crop' },
  { id: 5, name: 'Sân Tennis Lan Anh', address: '291 CMT8, Quận 10, HCM', sport: 'tennis', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?w=100&h=100&fit=crop' }
];

interface FormData {
  sport: string;
  customSport: string;
  venueId: number | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  title: string;
  maxPlayers: number;
  skillLevel: string;
  feeType: 'free' | 'paid';
  fee: string;
  description: string;
  imageUrl: string;
}

const INITIAL_FORM: FormData = {
  sport: '',
  customSport: '',
  venueId: null,
  date: '',
  startTime: '19:00',
  endTime: '21:00',
  location: '',
  title: '',
  maxPlayers: 4,
  skillLevel: 'beginner',
  feeType: 'free',
  fee: '',
  description: '',
  imageUrl: '',
};

const formatDate = (d: string) => {
  if (!d) return null;
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime = (t: string) => {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const PreviewCard: React.FC<{ form: FormData; step: number }> = ({ form, step }) => {
  const sport = SPORTS.find(s => s.id === form.sport);
  const sportLabel = form.sport === 'other'
    ? (form.customSport.trim() || 'Khác')
    : sport?.label;
  if (!form.sport) return null;

  return (
    <div className="cm-preview-card">
      <p className="cm-preview-title">Xem trước trận đấu</p>

      <div className="cm-preview-row">
        <i className="fa-solid fa-futbol"></i>
        <div>
          <div className="cm-preview-row-label">Môn thể thao</div>
          <span className="cm-preview-sport-badge">{sportLabel}</span>
        </div>
      </div>

      {step >= 2 && form.date && (
        <div className="cm-preview-row">
          <i className="fa-regular fa-calendar"></i>
          <div>
            <div className="cm-preview-row-label">Ngày & Giờ</div>
            <div className="cm-preview-row-value">{formatDate(form.date)}</div>
            {form.startTime && form.endTime && (
              <div className="cm-preview-row-label">
                {formatTime(form.startTime)} → {formatTime(form.endTime)}
              </div>
            )}
          </div>
        </div>
      )}

      {step >= 2 && form.location && (
        <div className="cm-preview-row">
          <i className="fa-solid fa-location-dot"></i>
          <div>
            <div className="cm-preview-row-label">Địa điểm</div>
            <div className="cm-preview-row-value" style={{ fontSize: '0.82rem' }}>{form.location}</div>
          </div>
        </div>
      )}

      {step === 3 && form.maxPlayers && (
        <div className="cm-preview-row">
          <i className="fa-solid fa-users"></i>
          <div>
            <div className="cm-preview-row-label">Số người chơi</div>
            <div className="cm-preview-row-value">{form.maxPlayers} người chơi · {SKILL_LEVELS.find(l => l.id === form.skillLevel)?.label || form.skillLevel}</div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="cm-preview-row">
          <i className="fa-solid fa-tag"></i>
          <div>
            <div className="cm-preview-row-label">Phí tham gia</div>
            <div className="cm-preview-row-value">
              {form.feeType === 'free' ? 'Miễn phí' : (form.fee ? `${Number(form.fee).toLocaleString()} VND` : 'Có phí')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateMatch: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (showSuccess) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/home');
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showSuccess, navigate]);

  const set = (key: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          set('imageUrl', compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const canGoNext = () => {
    if (step === 1) {
      if (form.sport === 'other') return form.customSport.trim() !== '';
      return form.sport !== '';
    }
    if (step === 2) return form.date !== '' && form.startTime !== '' && form.endTime !== '';
    return form.title.trim() !== '';
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        sport: form.sport,
        customSport: form.sport === 'other' ? form.customSport : null,
        venueId: form.venueId,
        location: form.venueId ? null : form.location,
        title: form.title,
        description: form.description,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        skillLevel: form.skillLevel,
        maxPlayers: form.maxPlayers,
        feeType: form.feeType,
        fee: form.feeType === 'paid' ? (parseInt(form.fee) || 0) : null,
        imageUrl: form.imageUrl || null
      };

      await matchService.createMatch(payload);
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tạo trận đấu');
    } finally {
      setLoading(false);
    }
  };

  const tip = TIPS[step - 1];
  const showPreview = form.sport !== '';

  if (showSuccess) {
    return (
      <div className="create-match-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh' }}>
        <div className="text-center p-5 bg-white shadow rounded-4 cm-form-card" style={{ maxWidth: '500px', margin: '20px' }}>
          <div className="mb-4 d-flex justify-content-center">
            <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success text-white" style={{ width: '80px', height: '80px', fontSize: '36px' }}>
              <i className="fa-solid fa-check"></i>
            </span>
          </div>
          <h2 className="fw-bold text-success mb-3">Tạo trận đấu thành công!</h2>
          <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
            Trận đấu <strong>"{form.title}"</strong> của bạn đã được tạo thành công trên SportMate.
          </p>
          <div className="p-3 bg-light rounded-3 mb-4 text-start" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            <div className="mb-1 text-truncate"><strong>Môn chơi:</strong> {form.sport === 'other' ? form.customSport : SPORTS.find(s => s.id === form.sport)?.label}</div>
            <div className="mb-1"><strong>Thời gian:</strong> {form.date} ({form.startTime} - {form.endTime})</div>
            <div className="text-truncate"><strong>Địa điểm:</strong> {form.location || 'Sân tự chọn'}</div>
          </div>
          <p className="text-muted small mb-0">
            Hệ thống đang chuyển về Trang chủ trong <strong>{countdown}</strong> giây...
          </p>
          <div className="progress mt-3" style={{ height: '4px' }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
              role="progressbar" 
              style={{ width: `${(countdown / 3) * 100}%`, transition: 'width 1s linear' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-match-page">
      <LoggedInNavbar />

      <div className="cm-shell container py-5">
        <div className="row justify-content-center g-5">

          <div className="col-lg-6 col-md-8">
            <div className="cm-form-card">
              <div className="cm-progress-bar mb-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className={`cm-progress-segment ${s <= step ? 'filled' : ''}`} />
                ))}
              </div>

              {error && (
                <div className="alert alert-danger mb-4 d-flex align-items-center" role="alert" style={{ fontSize: '0.875rem', borderRadius: '8px' }}>
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                  <div>{error}</div>
                </div>
              )}

              {step > 1 && (
                <button 
                  className="cm-back-btn mb-4" 
                  onClick={() => setStep(s => s - 1)}
                  disabled={loading}
                >
                  <i className="fa-solid fa-arrow-left me-2"></i> Quay lại
                </button>
              )}

              {step === 1 && <Step1 form={form} set={set} />}
              {step === 2 && <Step2 form={form} set={set} />}
              {step === 3 && <Step3 form={form} set={set} handleImageUpload={handleImageUpload} />}

              <div className="mt-4">
                {step < 3 ? (
                  <button
                    className={`btn cm-next-btn w-100 ${canGoNext() ? 'active' : ''}`}
                    disabled={!canGoNext()}
                    onClick={() => setStep(s => s + 1)}
                  >
                    Tiếp theo
                  </button>
                ) : (
                  <button
                    className={`btn cm-submit-btn w-100 ${canGoNext() && !loading ? 'active' : ''}`}
                    disabled={!canGoNext() || loading}
                    onClick={handleSubmit}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang tạo trận đấu...
                      </span>
                    ) : (
                      'Tạo trận đấu'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-none d-lg-block">
            <div className="cm-right-panel">
              <div className="cm-tip-card">
                <h6 className="fw-bold mb-1">{tip.title}</h6>
                <p className="mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tip.body}</p>
              </div>

              {showPreview && <PreviewCard form={form} step={step} />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Step1: React.FC<{ form: FormData; set: (k: keyof FormData, v: string | number) => void }> = ({ form, set }) => (
  <div>
    <p className="letter-spacing mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      Bước 1 / 3
    </p>
    <h2 className="cm-step-title">Bạn muốn chơi môn thể thao nào?</h2>
    <div className="cm-sport-grid mt-4">
      {SPORTS.map(sport => (
        <button
          key={sport.id}
          className={`cm-sport-card ${form.sport === sport.id ? 'selected' : ''}`}
          onClick={() => set('sport', sport.id)}
        >
          <span className="cm-sport-icon-wrapper">
            <img
              src={sport.icon}
              alt={sport.label}
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
            />
          </span>
          <span className="cm-sport-label">{sport.label}</span>
        </button>
      ))}
    </div>

    <div
      className={`cm-other-card mt-3 ${form.sport === 'other' ? 'selected' : ''}`}
      onClick={() => set('sport', 'other')}
    >
      <i className="fa-solid fa-plus cm-other-plus"></i>
      <input
        className="cm-other-input"
        placeholder="Môn thể thao khác (VD: Bắn cung, Leo núi, Yoga...)"
        value={form.customSport}
        onClick={(e) => {
          e.stopPropagation();
          set('sport', 'other');
        }}
        onFocus={() => set('sport', 'other')}
        onChange={e => set('customSport', e.target.value)}
      />
    </div>
  </div>
);

const Step2: React.FC<{ form: FormData; set: (k: keyof FormData, v: any) => void }> = ({ form, set }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isCustom, setIsCustom] = useState(form.venueId === null && form.location !== '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredVenues = MOCK_VENUES.filter(v => {
    if (form.sport && form.sport !== 'other' && v.sport !== form.sport) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()) && !v.address.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSelectVenue = (venue: any) => {
    set('venueId', venue.id);
    set('location', `${venue.name}, ${venue.address}`);
    setIsOpen(false);
    setIsCustom(false);
    setSearch('');
  };

  const handleCustomMode = () => {
    setIsCustom(true);
    setIsOpen(false);
    set('venueId', null);
    set('location', '');
  };

  const handleClearVenue = () => {
    set('venueId', null);
    set('location', '');
    setIsCustom(false);
  };

  return (
    <div>
      <p className="letter-spacing mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        Bước 2 / 3
      </p>
      <h2 className="cm-step-title">Thời gian & Địa điểm?</h2>

      <div className="cm-field-group mt-4">
        <label className="cm-label">
          <i className="fa-regular fa-calendar me-2" style={{ color: 'var(--text-muted)' }}></i>Ngày diễn ra
        </label>
        <input
          type="date"
          className="cm-input"
          value={form.date}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => set('date', e.target.value)}
        />
      </div>

      <div className="cm-time-row mt-3">
        <div className="cm-field-group">
          <label className="cm-label">
            <i className="fa-regular fa-clock me-2" style={{ color: 'var(--text-muted)' }}></i>Giờ bắt đầu
          </label>
          <input type="time" className="cm-input" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        </div>
        <span className="cm-time-separator">đến</span>
        <div className="cm-field-group">
          <label className="cm-label">Giờ kết thúc</label>
          <input type="time" className="cm-input" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        </div>
      </div>

      <div className="cm-field-group mt-3 position-relative" ref={dropdownRef}>
        <label className="cm-label">
          <i className="fa-solid fa-location-dot me-2" style={{ color: 'var(--text-muted)' }}></i>Sân chơi / Địa điểm
        </label>
        
        {!isCustom && form.venueId ? (
          <div className="cm-selected-venue">
            <div className="cm-selected-venue-info">
              <span className="fw-bold text-dark text-truncate d-block">{form.location.split(',')[0]}</span>
              <span className="text-muted small text-truncate d-block">{form.location.split(',').slice(1).join(',')}</span>
            </div>
            <button className="cm-selected-venue-clear" onClick={handleClearVenue}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        ) : isCustom ? (
          <div>
            <input
              type="text"
              className="cm-input"
              autoFocus
              placeholder="Nhập địa chỉ chính xác hoặc khu vực chơi..."
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
            <button 
              className="btn btn-link text-primary p-0 mt-2 text-decoration-none" 
              style={{ fontSize: '0.85rem', fontWeight: 600 }}
              onClick={handleClearVenue}
            >
              <i className="fa-solid fa-arrow-left me-1"></i> Quay lại tìm kiếm sân chơi
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              className="cm-input"
              placeholder="Tìm kiếm sân chơi..."
              value={search}
              onFocus={() => setIsOpen(true)}
              onChange={e => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
            />
            
            {isOpen && (
              <div className="cm-venue-dropdown">
                {filteredVenues.length > 0 ? (
                  <div className="cm-venue-list">
                    {filteredVenues.map(venue => (
                      <div key={venue.id} className="cm-venue-item" onClick={() => handleSelectVenue(venue)}>
                        <img src={venue.image} alt={venue.name} className="cm-venue-img" />
                        <div className="cm-venue-details">
                          <span className="cm-venue-name">{venue.name}</span>
                          <span className="cm-venue-address">{venue.address}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-muted small">
                    Không tìm thấy sân chơi nào cho môn {form.sport || 'này'}
                  </div>
                )}
                <div className="cm-venue-dropdown-footer" onClick={handleCustomMode}>
                  <i className="fa-solid fa-map-pin me-2"></i>
                  Không thấy sân của bạn? Nhập địa chỉ tự do
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Step3: React.FC<{ 
  form: FormData; 
  set: (k: keyof FormData, v: any) => void; 
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ form, set, handleImageUpload }) => (
  <div>
    <p className="letter-spacing mb-1" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
      Bước 3 / 3
    </p>
    <h2 className="cm-step-title">Chi tiết trận đấu</h2>

    <div className="cm-field-group mt-4">
      <label className="cm-label">Tiêu đề trận đấu</label>
      <input
        type="text"
        className="cm-input"
        placeholder={`Ví dụ: Trận giao lưu ${form.sport ? (SPORTS.find(s => s.id === form.sport)?.label || 'Bóng đá') : 'Bóng đá'} tại Quận 1`}
        value={form.title}
        maxLength={100}
        onChange={e => set('title', e.target.value)}
      />
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        <i className="fa-solid fa-users me-2" style={{ color: 'var(--text-muted)' }}></i>Số người chơi cần tìm
      </label>
      <div className="cm-stepper">
        <button className="cm-stepper-btn" onClick={() => set('maxPlayers', Math.max(2, Number(form.maxPlayers) - 1))}>−</button>
        <span className="cm-stepper-value">{form.maxPlayers}</span>
        <button className="cm-stepper-btn" onClick={() => set('maxPlayers', Math.min(100, Number(form.maxPlayers) + 1))}>+</button>
        <span className="ms-3" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>người chơi tổng cộng (đã gồm bạn)</span>
      </div>
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">Trình độ</label>
      <div className="cm-chip-group">
        {SKILL_LEVELS.map(lvl => (
          <button
            key={lvl.id}
            className={`cm-chip ${form.skillLevel === lvl.id ? 'selected' : ''}`}
            onClick={() => set('skillLevel', lvl.id)}
          >
            {lvl.label}
          </button>
        ))}
      </div>
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        <i className="fa-solid fa-tag me-2" style={{ color: 'var(--text-muted)' }}></i>Phí tham gia
      </label>
      <div className="cm-chip-group mb-2">
        <button className={`cm-chip ${form.feeType === 'free' ? 'selected' : ''}`} onClick={() => set('feeType', 'free')}>Miễn phí</button>
        <button className={`cm-chip ${form.feeType === 'paid' ? 'selected' : ''}`} onClick={() => set('feeType', 'paid')}>Có phí</button>
      </div>
      {form.feeType === 'paid' && (
        <div className="cm-fee-input-wrapper">
          <input
            type="number"
            className="cm-input"
            placeholder="50000"
            value={form.fee}
            onChange={e => set('fee', e.target.value)}
          />
          <span className="cm-fee-suffix">VND / người</span>
        </div>
      )}
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">Hình ảnh trận đấu</label>
      <p className="text-muted small mb-2">Chọn một ảnh mẫu có sẵn hoặc tải lên hình ảnh từ thiết bị của bạn:</p>
      
      <div className="d-flex gap-3 mb-3 overflow-auto py-1 align-items-center" style={{ scrollbarWidth: 'thin' }}>
        {[
          { url: '/hero_football.png', label: 'Bóng đá' },
          { url: '/hero_badminton.png', label: 'Cầu lông' },
          { url: '/hero_tennis.png', label: 'Tennis' },
          { url: '/hero_basketball.png', label: 'Bóng rổ' }
        ].map((preset) => (
          <div
            key={preset.url}
            className={`position-relative rounded overflow-hidden border ${form.imageUrl === preset.url ? 'border-primary border-2 shadow-sm' : 'border-light'}`}
            style={{ width: '90px', height: '60px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
            onClick={() => set('imageUrl', preset.url)}
          >
            <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {form.imageUrl === preset.url && (
              <div className="position-absolute top-0 end-0 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderRadius: '0 0 0 4px', fontSize: '0.7rem' }}>
                <i className="fa-solid fa-check"></i>
              </div>
            )}
            <div className="position-absolute bottom-0 start-0 w-100 text-center text-white bg-dark bg-opacity-75" style={{ fontSize: '0.65rem', padding: '1px 0' }}>
              {preset.label}
            </div>
          </div>
        ))}

        <div
          className={`position-relative rounded overflow-hidden border d-flex flex-column align-items-center justify-content-center ${form.imageUrl && !form.imageUrl.startsWith('/hero_') ? 'border-primary border-2 shadow-sm' : 'border-dashed border-secondary'}`}
          style={{ width: '90px', height: '60px', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', backgroundColor: '#f8f9fa' }}
          onClick={() => {
            const input = document.getElementById('custom-image-upload') as HTMLInputElement;
            if (input) input.click();
          }}
        >
          {form.imageUrl && !form.imageUrl.startsWith('/hero_') ? (
            <>
              <img src={form.imageUrl} alt="Uploaded" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div className="position-absolute top-0 end-0 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', borderRadius: '0 0 0 4px', fontSize: '0.7rem' }}>
                <i className="fa-solid fa-check"></i>
              </div>
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up text-muted mb-1" style={{ fontSize: '1.2rem' }}></i>
              <span className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 600 }}>Tải lên ảnh</span>
            </>
          )}
        </div>
      </div>

      <input
        type="file"
        id="custom-image-upload"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </div>

    <div className="cm-field-group mt-3">
      <label className="cm-label">
        Mô tả thêm <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(không bắt buộc)</span>
      </label>
      <textarea
        className="cm-input cm-textarea"
        rows={3}
        placeholder="Chia sẻ với người chơi những gì cần mang theo, luật chơi hoặc yêu cầu cụ thể..."
        value={form.description}
        onChange={e => set('description', e.target.value)}
      />
    </div>
  </div>
);

export default CreateMatch;
