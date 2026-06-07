import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sportService, type SportItem } from '../../services/sportService';
import './ExploreFilterSidebar.css';

const ExploreFilterSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [feeType, setFeeType] = useState('');
  const [radiusKm, setRadiusKm] = useState(10);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sports, setSports] = useState<SportItem[]>([]);

  const isSyncingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await sportService.getSports();
        setSports(data);
      } catch (err) {
        console.error('Error fetching sports:', err);
      }
    };
    fetchSports();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    isSyncingRef.current = true;
    setKeyword(params.get('keyword') || '');
    setSelectedSport(params.get('sport') || '');
    setSkillLevel(params.get('skillLevel') || '');
    setFeeType(params.get('feeType') || '');
    if (params.has('radiusKm')) setRadiusKm(parseFloat(params.get('radiusKm') as string));
    if (params.has('lat') && params.has('lng')) {
      setUserLat(parseFloat(params.get('lat') as string));
      setUserLng(parseFloat(params.get('lng') as string));
    } else {
      setUserLat(null);
      setUserLng(null);
    }
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, [location.search]);

  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (selectedSport) params.append('sport', selectedSport);
    if (skillLevel) params.append('skillLevel', skillLevel);
    if (feeType) params.append('feeType', feeType);
    if (userLat !== null && userLng !== null) {
      params.append('lat', userLat.toString());
      params.append('lng', userLng.toString());
      params.append('radiusKm', radiusKm.toString());
    }
    return params;
  }, [keyword, selectedSport, skillLevel, feeType, userLat, userLng, radiusKm]);

  const applyFilters = useCallback(() => {
    const params = buildSearchParams();
    navigate(`/explore?${params.toString()}`);
  }, [buildSearchParams, navigate]);

  useEffect(() => {
    if (isSyncingRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = buildSearchParams();
      const newSearch = params.toString();
      const currentSearch = location.search.slice(1);
      if (newSearch !== currentSearch) {
        navigate(`/explore?${newSearch}`);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, selectedSport, skillLevel, feeType, userLat, userLng, radiusKm, buildSearchParams, navigate, location.search]);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          setIsGettingLocation(false);
        },
        () => {
          alert('Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.');
          setIsGettingLocation(false);
        }
      );
    } else {
      alert('Trình duyệt của bạn không hỗ trợ lấy vị trí.');
      setIsGettingLocation(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedSport('');
    setSkillLevel('');
    setFeeType('');
    setRadiusKm(10);
    setUserLat(null);
    setUserLng(null);
    navigate('/explore');
  };

  const activeFilterCount = [selectedSport, skillLevel, feeType, userLat !== null].filter(Boolean).length;

  return (
    <aside className="explore-filter-sidebar">
      <div className="sidebar-card sticky-top">
        <div className="sidebar-card-header mb-3">
          <h6 className="fw-bold mb-0">
            <i className="fa-solid fa-sliders me-2"></i>Bộ lọc
          </h6>
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">{activeFilterCount}</span>
          )}
        </div>



        <div className="mb-3">
          <label className="form-label small fw-bold">Môn thể thao</label>
          <select
            className="form-select form-select-sm"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            <option value="">Tất cả các môn</option>
            {sports.map((sport) => (
              <option key={sport.id} value={sport.slug}>{sport.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">Trình độ</label>
          <select
            className="form-select form-select-sm"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          >
            <option value="">Mọi trình độ</option>
            <option value="newbie">Mới chơi</option>
            <option value="beginner">Cơ bản</option>
            <option value="intermediate">Trung bình</option>
            <option value="advanced">Nâng cao</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-bold">Chi phí</label>
          <div className="d-flex flex-column gap-1">
            {[
              { value: '', label: 'Tất cả' },
              { value: 'free', label: 'Miễn phí' },
              { value: 'paid', label: 'Có phí' },
            ].map((opt) => (
              <div className="form-check" key={opt.value || 'all'}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="sidebarFeeType"
                  id={`sidebar-fee-${opt.value || 'all'}`}
                  value={opt.value}
                  checked={feeType === opt.value}
                  onChange={(e) => setFeeType(e.target.value)}
                />
                <label className="form-check-label small" htmlFor={`sidebar-fee-${opt.value || 'all'}`}>
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-3" />

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label small fw-bold mb-0">Vị trí</label>
            <button
              className="btn btn-sm btn-outline-primary py-0 px-2 small"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              type="button"
            >
              {isGettingLocation ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <><i className="fa-solid fa-location-crosshairs me-1"></i>Lấy vị trí</>
              )}
            </button>
          </div>
          {userLat !== null && userLng !== null ? (
            <p className="text-success small mb-0">
              <i className="fa-solid fa-check-circle me-1"></i>Đã lấy vị trí
            </p>
          ) : (
            <p className="text-muted small mb-0">Lấy vị trí để lọc theo khoảng cách</p>
          )}
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <label className="form-label small fw-bold">Bán kính</label>
            <span className="small text-primary fw-bold">{radiusKm} km</span>
          </div>
          <input
            type="range"
            className="form-range"
            min="1"
            max="50"
            step="1"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            disabled={userLat === null || userLng === null}
          />
        </div>

        <button className="btn btn-dark w-100 fw-bold mb-2" type="button" onClick={applyFilters}>
          Áp dụng bộ lọc
        </button>
        <button className="btn btn-outline-secondary w-100 btn-sm" type="button" onClick={handleClearFilters}>
          Xóa bộ lọc
        </button>
      </div>
    </aside>
  );
};

export default ExploreFilterSidebar;
