import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { matchService, type MatchDetail } from "../../services/matchService";
import { useNotifications } from "../../context/NotificationContext";
import { useSportsQuery } from "../../hooks/useSportQueries";
import "./LoggedInNavbar.css";

const LoggedInNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const unreadMessageCount = notifications.filter(n => n.type === "NEW_MESSAGE" && !n.isRead).length;
  const unreadGeneralCount = Math.max(0, unreadCount - unreadMessageCount);
  const generalNotifications = notifications.filter(n => n.type !== "NEW_MESSAGE");

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAllAsRead();
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    if (notif.relatedEntityId) {
      if (
        notif.type === "NEW_MESSAGE" ||
        notif.type === "BILL_CREATED" ||
        notif.type === "BILL_PAID" ||
        notif.type === "BILL_CONFIRMED"
      ) {
        navigate(`/messages?roomId=${notif.relatedEntityId}`);
      } else if (notif.type === 'FRIEND_REQUEST' || notif.type === 'FRIEND_ACCEPTED') {
        navigate(`/profile/${notif.relatedEntityId}`);
      } else {
        navigate(`/matches/${notif.relatedEntityId}`);
      }
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const [keyword, setKeyword] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  // Sử dụng React Query để tự động cache danh mục thể thao toàn cục (staleTime 24h)
  const { data: sports = [] } = useSportsQuery();

  const [selectedSport, setSelectedSport] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [feeType, setFeeType] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(10);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationName, setLocationName] = useState("TP. HCM, VN");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const [liveResults, setLiveResults] = useState<MatchDetail[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLiveSearching, setIsLiveSearching] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (location.pathname === "/explore") {
      setShowFilter(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/explore") return;
    const params = new URLSearchParams(location.search);
    isSyncingRef.current = true;
    setKeyword(params.get("keyword") || "");
    setSelectedSport(params.get("sport") || "");
    setSkillLevel(params.get("skillLevel") || "");
    setFeeType(params.get("feeType") || "");
    if (params.has("radiusKm")) setRadiusKm(parseFloat(params.get("radiusKm") as string));
    if (params.has("lat") && params.has("lng")) {
      setUserLat(parseFloat(params.get("lat") as string));
      setUserLng(parseFloat(params.get("lng") as string));
      setLocationName("Vị trí của bạn");
    }
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilter(false);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.append("keyword", keyword.trim());
    if (selectedSport) params.append("sport", selectedSport);
    if (skillLevel) params.append("skillLevel", skillLevel);
    if (feeType) params.append("feeType", feeType);
    if (userLat !== null && userLng !== null) {
      params.append("lat", userLat.toString());
      params.append("lng", userLng.toString());
      params.append("radiusKm", radiusKm.toString());
    }
    return params;
  }, [keyword, selectedSport, skillLevel, feeType, userLat, userLng, radiusKm]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setShowFilter(false);
    const params = buildSearchParams();
    navigate(`/explore?${params.toString()}`);
  };

  useEffect(() => {
    if (isSyncingRef.current) return;

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      if (!keyword.trim() && location.pathname !== "/explore") return;

      const params = buildSearchParams();
      const newSearch = params.toString();
      const currentSearch = location.pathname === "/explore" ? location.search.slice(1) : "";
      if (newSearch !== currentSearch && location.pathname === "/explore") {
        navigate(`/explore?${newSearch}`);
      }
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [keyword, selectedSport, skillLevel, feeType, userLat, userLng, radiusKm, buildSearchParams, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (!keyword.trim()) {
      setLiveResults([]);
      setShowSuggestions(false);
      return;
    }

    if (liveSearchRef.current) clearTimeout(liveSearchRef.current);
    liveSearchRef.current = setTimeout(async () => {
      setIsLiveSearching(true);
      try {
        const data = await matchService.exploreMatches({
          keyword: keyword.trim(),
          sport: selectedSport || undefined,
          skillLevel: skillLevel || undefined,
          feeType: feeType || undefined,
          lat: userLat ?? undefined,
          lng: userLng ?? undefined,
          radiusKm: userLat !== null ? radiusKm : undefined,
        });
        setLiveResults(data.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error("Live search error:", err);
        setLiveResults([]);
      } finally {
        setIsLiveSearching(false);
      }
    }, 300);

    return () => {
      if (liveSearchRef.current) clearTimeout(liveSearchRef.current);
    };
  }, [keyword, selectedSport, skillLevel, feeType, userLat, userLng, radiusKm]);

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

  const handleSuggestionClick = (matchId: number) => {
    setShowSuggestions(false);
    navigate(`/matches/${matchId}`);
  };

  const handleInputFocus = () => {
    if (keyword.trim() && liveResults.length > 0) {
      setShowSuggestions(true);
    }
  };

  const isExplorePage = location.pathname === "/explore";

  const handleFilterToggle = () => {
    if (isExplorePage) {
      setShowFilter(false);
      setShowSuggestions(false);
      document.querySelector(".explore-filter-sidebar")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setShowFilter(!showFilter);
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
                  onFocus={handleInputFocus}
                  autoComplete="off"
                />
                <button
                  className="btn filter-toggle-btn"
                  type="button"
                  onClick={handleFilterToggle}
                  title={isExplorePage ? "Cuộn tới bộ lọc bên trái" : "Bộ lọc nâng cao"}
                >
                  <i className="fa-solid fa-sliders"></i>
                </button>
                <span className="input-group-text search-location text-truncate" style={{ maxWidth: "120px" }} title={locationName}>
                  {locationName}
                </span>
                <button className="btn search-btn" type="submit">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
            </form>

            {showSuggestions && keyword.trim() && (
              <div className="live-search-dropdown shadow-lg">
                {isLiveSearching ? (
                  <div className="live-search-loading">
                    <span className="spinner-border spinner-border-sm text-primary me-2" role="status" aria-hidden="true"></span>
                    Đang tìm kiếm...
                  </div>
                ) : liveResults.length === 0 ? (
                  <div className="live-search-empty">Không tìm thấy trận đấu phù hợp</div>
                ) : (
                  <>
                    <div className="live-search-header">Kết quả gợi ý</div>
                    <ul className="live-search-list">
                      {liveResults.map((match) => (
                        <li key={match.id}>
                          <button
                            type="button"
                            className="live-search-item"
                            onClick={() => handleSuggestionClick(match.id)}
                          >
                            <span className="live-search-sport">{match.sport}</span>
                            <span className="live-search-title">{match.title}</span>
                            {match.venue?.name && (
                              <span className="live-search-location">
                                <i className="fa-solid fa-location-dot me-1"></i>
                                {match.venue.name}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="live-search-view-all"
                      onClick={() => handleSearch()}
                    >
                      Xem tất cả kết quả cho &ldquo;{keyword.trim()}&rdquo;
                      <i className="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                  </>
                )}
              </div>
            )}

            {showFilter && !isExplorePage && (
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
                    {userLat !== null && userLng !== null ? (
                      <p className="text-success small mb-2"><i className="fa-solid fa-check-circle me-1"></i> Đã lấy vị trí</p>
                    ) : (
                      <p className="text-muted small mb-2" style={{ fontSize: "0.75rem" }}>*Cần lấy vị trí để lọc theo khoảng cách</p>
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
                      min="1"
                      max="50"
                      step="1"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      disabled={userLat === null || userLng === null}
                    />
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.7rem" }}>
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
            <li className="nav-item mx-2 dropdown notification-dropdown-container">
              <a
                className="nav-link nav-icon-link position-relative dropdown-toggle no-caret"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                data-bs-display="static"
                aria-expanded="false"
              >
                <i className="fa-regular fa-bell"></i>
                {unreadGeneralCount > 0 && (
                  <span className="notification-badge">{unreadGeneralCount}</span>
                )}
              </a>
              <div className="dropdown-menu dropdown-menu-end notification-dropdown shadow-lg border-0">
                <div className="notification-header d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">Thông báo</h6>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm text-decoration-none p-0 read-all-btn"
                      onClick={handleMarkAllAsRead}
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>
                <div className="notification-body">
                  {generalNotifications.length === 0 ? (
                    <div className="notification-empty py-4 text-center text-muted">
                      <i className="fa-regular fa-bell-slash fs-3 mb-2 d-block text-muted"></i>
                      Không có thông báo mới
                    </div>
                  ) : (
                    <div className="notification-list">
                      {generalNotifications.map((notif) => (
                        <button
                          key={notif.id}
                          className={`notification-item d-flex gap-3 text-start border-0 w-100 ${
                            !notif.isRead ? "unread" : ""
                          }`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="notification-icon-wrapper flex-shrink-0">
                            {notif.senderAvatar ? (
                              <img
                                src={notif.senderAvatar}
                                alt={notif.senderName}
                                className="notification-sender-avatar"
                              />
                            ) : (
                              <div className="notification-sender-placeholder">
                                {notif.senderName?.charAt(0).toUpperCase() || "S"}
                              </div>
                            )}
                          </div>
                          <div className="notification-content-wrapper flex-grow-1">
                            <p className="notification-title mb-1 text-wrap">
                              {notif.type === "BILL_CREATED" && (
                                <i className="fa-solid fa-file-invoice-dollar me-1 text-success"></i>
                              )}
                              {notif.type === "BILL_PAID" && (
                                <i className="fa-solid fa-receipt me-1 text-warning"></i>
                              )}
                              {notif.type === "BILL_CONFIRMED" && (
                                <i className="fa-solid fa-circle-check me-1 text-success"></i>
                              )}
                              {notif.type === "MATCH_REVIEW_REQUEST" && (
                                <i className="fa-solid fa-star me-1 text-warning"></i>
                              )}
                              <strong>{notif.senderName}</strong> {notif.title}
                            </p>
                            <p className="notification-desc mb-1 text-wrap">
                              {notif.content}
                            </p>
                            <span className="notification-time">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <span className="unread-indicator flex-shrink-0"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="notification-footer text-center border-top">
                  <Link
                    to="/notifications"
                    className="btn btn-link btn-sm text-decoration-none w-100 text-dark fw-semibold py-2"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            </li>
            <li className="nav-item mx-2">
              <Link className="nav-link nav-icon-link position-relative" to="/messages">
                <i className="fa-regular fa-message"></i>
                {unreadMessageCount > 0 && (
                  <span className="notification-badge">{unreadMessageCount}</span>
                )}
              </Link>
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
                  {user?.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item fw-bold text-primary" to="/admin">
                        <i className="fa-solid fa-shield-halved me-2"></i>Quản trị hệ thống
                      </Link>
                    </li>
                  )}
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
