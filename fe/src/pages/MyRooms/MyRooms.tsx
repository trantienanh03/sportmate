import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import LoggedInNavbar from "../../components/LoggedInNavbar/LoggedInNavbar";
import Footer from "../../components/Footer/Footer";
import { matchService, type MatchDetail } from "../../services/matchService";
import "./MyRooms.css";

const MyRooms: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchDetail[]>(() => {
    return matchService.getCachedMyRooms() || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !matchService.hasCachedMyRooms();
  });
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"Active" | "Past" | "Cancelled">("Active");
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMyRooms = async () => {
      try {
        if (!matchService.hasCachedMyRooms()) {
          setIsLoading(true);
        }
        setError("");
        const data = await matchService.getMyRooms();
        setMatches(data);
      } catch (err: any) {
        if (!matchService.hasCachedMyRooms()) {
          setError(err.message || "Không thể tải danh sách trận đấu của bạn");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyRooms();
  }, []);

  useEffect(() => {
    if (!isLoading && cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll(".room-card-anim");
      if (cards.length > 0) {
        gsap.killTweensOf(cards);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out",
          }
        );
      }
    }
  }, [activeTab, matches, isLoading]);

  const getSportIconAndClass = (sport: string) => {
    if (!sport) return { icon: "fa-futbol", className: "sport-football" };
    const s = sport.toLowerCase();
    if (s.includes("bóng đá") || s.includes("football") || s.includes("soccer")) {
      return { icon: "fa-futbol", className: "sport-football" };
    }
    if (s.includes("bóng rổ") || s.includes("basketball")) {
      return { icon: "fa-basketball", className: "sport-basketball" };
    }
    if (s.includes("cầu lông") || s.includes("badminton") || s.includes("pickleball")) {
      return { icon: "fa-table-tennis-paddle-ball", className: "sport-badminton" };
    }
    if (s.includes("tennis") || s.includes("quần vợt")) {
      return { icon: "fa-baseball", className: "sport-tennis" };
    }
    return { icon: "fa-futbol", className: "sport-football" };
  };

  const translateSportName = (sport: string) => {
    if (!sport) return sport;
    const s = sport.toLowerCase();
    if (s.includes("bóng đá") || s.includes("football") || s.includes("soccer")) {
      return "Bóng đá";
    }
    if (s.includes("bóng rổ") || s.includes("basketball")) {
      return "Bóng rổ";
    }
    if (s.includes("cầu lông") || s.includes("badminton") || s.includes("pickleball")) {
      return "Cầu lông";
    }
    if (s.includes("tennis") || s.includes("quần vợt")) {
      return "Quần vợt";
    }
    return sport;
  };

  const formatMatchTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${dayName}, ${day} tháng ${month} · ${hours}:${minutes}`;
    } catch (e) {
      return timeStr;
    }
  };

  const handleCancelMatch = async (id: number, title: string) => {
    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy trận đấu "${title}" không?`);
    if (confirmCancel) {
      try {
        const updated = await matchService.cancelMatch(id);
        setMatches((prev) =>
          prev.map((match) => (match.id === id ? updated : match))
        );
        alert(`Đã hủy thành công trận đấu "${title}".`);
      } catch (err: any) {
        alert(err.message || "Không thể hủy trận đấu");
      }
    }
  };

  const handleStartMatch = async (id: number, title: string) => {
    const confirmStart = window.confirm(`Bắt đầu trận đấu "${title}" ngay bây giờ?`);
    if (confirmStart) {
      try {
        const updated = await matchService.updateMatchStatus(id, "completed");
        setMatches((prev) =>
          prev.map((match) => (match.id === id ? updated : match))
        );
        alert(`Trận đấu "${title}" đã được bắt đầu.`);
      } catch (err: any) {
        alert(err.message || "Không thể bắt đầu trận đấu");
      }
    }
  };

  const handleResumeMatch = async (id: number, title: string) => {
    const confirmResume = window.confirm(`Khôi phục trận đấu "${title}" để tiếp tục?`);
    if (confirmResume) {
      try {
        const updated = await matchService.resumeMatch(id);
        setMatches((prev) =>
          prev.map((match) => (match.id === id ? updated : match))
        );
        alert(`Đã khôi phục trận đấu "${title}".`);
      } catch (err: any) {
        alert(err.message || "Không thể khôi phục trận đấu");
      }
    }
  };

  // Filter matches based on the selected tab
  const filteredMatches = matches.filter((match) => {
    const status = match.status.toUpperCase();
    if (activeTab === "Active") {
      return status === "OPEN" || status === "FULL";
    }
    if (activeTab === "Past") {
      return status === "COMPLETED";
    }
    if (activeTab === "Cancelled") {
      return status === "CANCELLED";
    }
    return true;
  });

  return (
    <div className="my-rooms-page">
      <LoggedInNavbar />

      <main className="my-rooms-main py-5">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h1 className="my-rooms-title mb-0">Các trận đấu của tôi</h1>
          </div>

          <div className="tabs-container mb-4">
            <div className="segmented-control">
              <button
                className={`segmented-button ${activeTab === "Active" ? "active" : ""}`}
                onClick={() => setActiveTab("Active")}
              >
                Hoạt động
              </button>
              <button
                className={`segmented-button ${activeTab === "Past" ? "active" : ""}`}
                onClick={() => setActiveTab("Past")}
              >
                Đã diễn ra
              </button>
              <button
                className={`segmented-button ${activeTab === "Cancelled" ? "active" : ""}`}
                onClick={() => setActiveTab("Cancelled")}
              >
                Đã hủy
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger mb-4">{error}</div>}

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-2 text-muted">Đang tải danh sách trận đấu của bạn...</p>
            </div>
          ) : (
            <div className="row g-4" ref={cardsContainerRef}>
              {filteredMatches.length === 0 ? (
                <div className="col-12 text-center py-5 empty-rooms-state">
                  <i className="fa-regular fa-folder-open text-muted fa-3x mb-3"></i>
                  <h5 className="fw-bold text-dark">Không tìm thấy trận đấu nào</h5>
                  <p className="text-muted mb-4">Bạn chưa có trận đấu nào trong danh mục này.</p>
                  <Link to="/create-match" className="btn btn-dark rounded-pill px-4 py-2 fw-bold">
                    Tạo trận đấu ngay
                  </Link>
                </div>
              ) : (
                filteredMatches.map((match) => {
                  const maxPlayers = match.maxPlayers || 1;
                  const rosterPercent = (match.currentPlayers / maxPlayers) * 100;
                  const progressColorClass = match.status.toUpperCase() === "FULL" ? "bg-success" : "bg-primary";
                  const sportInfo = getSportIconAndClass(match.sport);
                  const locationName = match.venue?.name || match.locationText || "Chưa có địa điểm";
                  const formattedTime = formatMatchTime(match.startTime);

                  return (
                    <div className="col-12 col-md-6 room-card-anim" key={match.id} style={{ opacity: 0 }}>
                      <Link
                        to={`/matches/${match.id}`}
                        className="room-card-link text-decoration-none text-dark d-block h-100"
                      >
                        <div className="room-card shadow-sm h-100 d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex gap-2">
                              <span className={`badge-custom ${sportInfo.className}`}>
                                <i className={`fa-solid ${sportInfo.icon} me-1`}></i>
                                {translateSportName(match.sport)}
                              </span>
                              <span className="badge-custom badge-time">
                                {formattedTime}
                              </span>
                            </div>
                            <span className={`badge-status ${match.status.toLowerCase()}`}>
                              {match.status.toUpperCase() === "OPEN"
                                ? "Đang tuyển"
                                : match.status.toUpperCase() === "FULL"
                                  ? "Đã đầy"
                                  : match.status.toUpperCase() === "COMPLETED"
                                    ? "Hoàn thành"
                                    : "Đã hủy"}
                            </span>
                          </div>

                          <h4 className="room-card-title fw-bold mb-2">
                            {match.title}
                          </h4>
                          <p className="room-card-location mb-3">
                            <i className="fa-solid fa-location-dot me-1 text-muted"></i>
                            {locationName}
                          </p>

                          <hr className="card-divider" />

                          <div className="roster-status-section mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="roster-label">Danh sách tham gia</span>
                              <span className="roster-count fw-bold">
                                {match.currentPlayers}/{match.maxPlayers} đã tham gia
                              </span>
                            </div>
                            <div className="progress roster-progress" style={{ height: "6px" }}>
                              <div
                                className={`progress-bar ${progressColorClass}`}
                                role="progressbar"
                                style={{ width: `${rosterPercent}%` }}
                                aria-valuenow={match.currentPlayers}
                                aria-valuemin={0}
                                aria-valuemax={match.maxPlayers}
                              ></div>
                            </div>
                          </div>

                          <div className="d-flex align-items-center justify-content-between pt-1 mb-4">
                            <div className="d-flex align-items-center">
                              <div className="avatar-group d-flex align-items-center me-2">
                                {match.participants && match.participants.slice(0, 3).map((participant, index) => (
                                  <div
                                    key={participant.userId}
                                    className="avatar-item"
                                    style={{ zIndex: 10 - index }}
                                    title={participant.fullName}
                                  >
                                    {participant.avatarUrl ? (
                                      <img src={participant.avatarUrl} alt={participant.fullName} />
                                    ) : (
                                      <div className="avatar-placeholder">
                                        {participant.fullName.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {match.currentPlayers > 3 && (
                                  <div className="avatar-item avatar-more" style={{ zIndex: 1 }}>
                                    +{match.currentPlayers - 3}
                                  </div>
                                )}
                              </div>
                              <span className="avatar-status-text text-muted">
                                {match.status.toUpperCase() === "FULL"
                                  ? "Sẵn sàng thi đấu"
                                  : match.status.toUpperCase() === "COMPLETED"
                                    ? "Trận đấu đã kết thúc"
                                    : match.status.toUpperCase() === "CANCELLED"
                                      ? "Trận đấu đã bị hủy"
                                      : `Đang chờ thêm ${match.maxPlayers - match.currentPlayers} người`}
                              </span>
                            </div>
                          </div>

                          {match.status.toUpperCase() === "OPEN" && (
                            <div className="d-flex align-items-center gap-2 mt-auto">
                              <button
                                className="btn btn-card-chat flex-grow-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/messages?roomId=${match.id}`);
                                }}
                              >
                                <i className="fa-regular fa-message me-2"></i>
                                Trò chuyện
                              </button>
                              <button
                                className="btn btn-card-manage flex-grow-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  alert("Mở bảng điều khiển quản lý trận đấu...");
                                }}
                              >
                                <i className="fa-solid fa-users-gear me-2"></i>
                                Quản lý
                              </button>
                              <button
                                className="btn btn-card-cancel"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCancelMatch(match.id, match.title);
                                }}
                                title="Hủy trận đấu"
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            </div>
                          )}

                          {match.status.toUpperCase() === "FULL" && (
                            <div className="d-flex align-items-center gap-2 mt-auto">
                              <button
                                className="btn btn-card-start flex-grow-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStartMatch(match.id, match.title);
                                }}
                              >
                                <i className="fa-solid fa-play me-2"></i>
                                Bắt đầu trận
                              </button>
                              <button
                                className="btn btn-card-chat-circle"
                                title="Trò chuyện"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/messages?roomId=${match.id}`);
                                }}
                              >
                                <i className="fa-regular fa-message"></i>
                              </button>
                            </div>
                          )}

                          {(match.status.toUpperCase() === "COMPLETED" || match.status.toUpperCase() === "CANCELLED") && (
                            <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
                              <span className="text-muted small">
                                Trạng thái: <strong>{match.status.toUpperCase() === "COMPLETED" ? "Đã kết thúc" : "Đã hủy"}</strong>
                              </span>
                              {match.status.toUpperCase() === "CANCELLED" ? (
                                <button
                                  className="btn btn-link btn-sm text-decoration-none p-0 text-success"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleResumeMatch(match.id, match.title);
                                  }}
                                >
                                  Ngừng hủy
                                </button>
                              ) : (
                                <span className="btn btn-link btn-sm text-decoration-none p-0 text-secondary">
                                  Xem chi tiết
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyRooms;
