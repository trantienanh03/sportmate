import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sportService, type SportItem } from "../../services/sportService";
import "./LoggedInNavbar.css";

const LoggedInNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [sports, setSports] = useState<SportItem[]>([]);
  
  // Filter states
  const [selectedSport, setSelectedSport] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [feeType, setFeeType] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(10);
  
  // Location states
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("TP. HCM, VN");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await sportService.getSports();
        setSports(data);
      } catch (err) {
        console.error("Error fetching sports:", err);
      }
    };
    fetchSports();
  }, []);

  // Sync keyword from URL if on explore page
  useEffect(() => {
    if (location.pathname === '/explore') {
      const params = new URLSearchParams(location.search);
      if (params.has('keyword')) {
        setKeyword(params.get('keyword') || '');
      }
    }
  }, [location]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate("/");
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(position.coords.latitude);
          setUserLng(position.coords.longitude);
          setLocationName("Vị trí của bạn");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập vị trí.");
          setIsGettingLocation(false);
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ lấy vị trí.");
      setIsGettingLocation(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("keyword", keyword.trim());
    if (selectedSport) params.append("sport", selectedSport);
    if (skillLevel) params.append("skillLevel", skillLevel);
    if (feeType) params.append("feeType", feeType);
    if (userLat && userLng) {
      params.append("lat", userLat.toString());
      params.append("lng", userLng.toString());
      params.append("radiusKm", radiusKm.toString());
    }
    
    setShowFilter(false);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <nav className="navbar navbar-expand-lg logged-in-nav sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold me-4" to="/home">
          <span className="brand-sport">Sport</span>
          <span className="brand-matcher">Mate</span>
        </Link>
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#loggedInNav"
          aria-controls="loggedInNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="loggedInNav">
          <div className="search-form-container me-auto position-relative" ref={filterRef}>
            <form className="d-flex search-form" onSubmit={handleSearch}>
              <div className="input-group search-group">
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Tìm kiếm trận đấu..."
                  aria-label="Tìm kiếm"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <button 
                  className="btn filter-toggle-btn" 
                  type="button"
                  onClick={() => setShowFilter(!showFilter)}
                  title="Bộ lọc nâng cao"
                >
                  <i className="fa-solid fa-sliders"></i>
                </button>
                <span className="input-group-text search-location text-truncate" style={{ maxWidth: '120px' }} title={locationName}>
                  {locationName}
                </span>
                <button className="btn search-btn" type="submit">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </form>

            {/* Advanced Filter Dropdown Panel */}
            {showFilter && (
              <div className="advanced-filter-panel shadow-lg">
                <div className="filter-header d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Bộ lọc tìm kiếm</h6>
                  <button className="btn-close" onClick={() => setShowFilter(false)}></button>
                </div>

                <div className="filter-body">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Môn thể thao</label>
                    <select 
                      className="form-select form-select-sm" 
                      value={selectedSport} 
                      onChange={(e) => setSelectedSport(e.target.value)}
                    >
                      <option value="">Tất cả các môn</option>
                      {sports.map(sport => (
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
                    <div className="d-flex gap-2">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="feeType" id="feeAll" value="" checked={feeType === ""} onChange={(e) => setFeeType(e.target.value)} />
                        <label className="form-check-label small" htmlFor="feeAll">Tất cả</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="feeType" id="feeFree" value="free" checked={feeType === "free"} onChange={(e) => setFeeType(e.target.value)} />
                        <label className="form-check-label small" htmlFor="feeFree">Miễn phí</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" name="feeType" id="feePaid" value="paid" checked={feeType === "paid"} onChange={(e) => setFeeType(e.target.value)} />
                        <label className="form-check-label small" htmlFor="feePaid">Có phí</label>
                      </div>
                    </div>
                  </div>

                  <hr className="my-3" />

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-bold mb-0">Vị trí của bạn</label>
                      <button 
                        className="btn btn-sm btn-outline-primary py-0 px-2 small" 
                        onClick={handleGetLocation}
                        disabled={isGettingLocation}
                        type="button"
                      >
                        {isGettingLocation ? (
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        ) : (
                          <i className="fa-solid fa-location-crosshairs me-1"></i>
                        )}
                        Lấy vị trí
                      </button>
                    </div>
                    {userLat && userLng ? (
                      <p className="text-success small mb-2"><i className="fa-solid fa-check-circle me-1"></i> Đã lấy vị trí</p>
                    ) : (
                      <p className="text-muted small mb-2" style={{ fontSize: '0.75rem' }}>*Cần lấy vị trí để lọc theo khoảng cách</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <label className="form-label small fw-bold">Bán kính tìm kiếm</label>
                      <span className="small text-primary fw-bold">{radiusKm} km</span>
                    </div>
                    <input 
                      type="range" 
                      className="form-range" 
                      min="1" max="50" step="1" 
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      disabled={!userLat || !userLng}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.7rem' }}>
                      <span>1km</span>
                      <span>50km</span>
                    </div>
                  </div>

                  <button className="btn btn-dark w-100 fw-bold" type="button" onClick={() => handleSearch()}>
                    Áp dụng bộ lọc
                  </button>
                </div>
              </div>
            )}
          </div>

          <ul className="navbar-nav ms-auto align-items-center flex-row gap-3 gap-lg-0 mt-3 mt-lg-0">
            <li className="nav-item d-none d-lg-block">
              <Link className="btn btn-nav-create mt-1 me-2" to="/create-match">
                Tạo trận đấu
              </Link>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link nav-icon-link" href="#">
                <i className="fa-regular fa-bell"></i>
                <span className="notification-dot"></span>
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link nav-icon-link" href="#">
                <i className="fa-regular fa-message"></i>
              </a>
            </li>
            <li className="nav-item mx-2">
              <a className="nav-link nav-icon-link" href="#">
                <i className="fa-regular fa-circle-question"></i>
              </a>
            </li>
            <li className="nav-item ms-2">
              <div className="dropdown">
                <a
                  className="nav-link dropdown-toggle user-avatar-link"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="user-avatar">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span>
                        {user?.fullName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                  <li className="px-3 py-2 border-bottom">
                    <span
                      className="fw-bold d-block text-truncate"
                      style={{ maxWidth: "150px" }}
                    >
                      {user?.fullName}
                    </span>
                    <small
                      className="text-muted d-block text-truncate"
                      style={{ maxWidth: "150px" }}
                    >
                      {user?.email}
                    </small>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Hồ sơ
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/my-rooms">
                      Phòng của tôi
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">
                      Cài đặt
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a
                      className="dropdown-item text-danger"
                      href="#"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default LoggedInNavbar;
