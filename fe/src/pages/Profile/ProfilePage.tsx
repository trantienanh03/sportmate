import React, { useEffect, useState } from "react";
import LoggedInNavbar from "../../components/LoggedInNavbar/LoggedInNavbar";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import "./ProfilePage.css";

const formatDate = (value?: string | null) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const toInputValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

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
  sport: string;
  timeAgo: string;
  message: string;
  rating: number;
};

const PROFILE_MENU = [
  { label: "Home", icon: "fa-solid fa-house" },
  { label: "Payroll", icon: "fa-regular fa-circle-user" },
  { label: "Match Detail", icon: "fa-regular fa-star" },
  { label: "Messages", icon: "fa-regular fa-comment-dots" },
  { label: "Profile", icon: "fa-solid fa-user", active: true },
  { label: "Create Match", icon: "fa-regular fa-square-plus" },
  { label: "Rating Flow", icon: "fa-regular fa-thumbs-up" },
];

const STAT_CARDS = [
  {
    label: "Matches",
    value: "42",
    icon: "fa-solid fa-futbol",
    color: "#2563eb",
  },
  { label: "Hosted", value: "8", icon: "fa-solid fa-crown", color: "#16a34a" },
  { label: "Rating", value: "4.7", icon: "fa-solid fa-star", color: "#d97706" },
  {
    label: "Show-up",
    value: "95%",
    icon: "fa-solid fa-circle-check",
    color: "#7c3aed",
  },
];

const SKILL_LEVELS = [
  { label: "Football", emoji: "⚽", level: "Advanced", tier: 3 },
  { label: "Badminton", emoji: "🏸", level: "Pro", tier: 4 },
  { label: "Pickleball", emoji: "🏓", level: "Newbie", tier: 1 },
];

const BADGES = [
  { title: "10 Matches Joined", icon: "fa-solid fa-medal", active: true },
  { title: "Fair Play", icon: "fa-solid fa-hands-holding-circle" },
  { title: "Always On Time", icon: "fa-solid fa-bolt" },
];

const REVIEWS: ReviewItem[] = [
  {
    name: "Linh N.",
    sport: "Weekend Football Match",
    timeAgo: "2 days ago",
    message: "Great player! Very skilled and always punctual.",
    rating: 5,
  },
  {
    name: "Duo P.",
    sport: "Badminton Doubles",
    timeAgo: "1 week ago",
    message: "Fun to play with, good sportsmanship.",
    rating: 4,
  },
  {
    name: "Khanh D.",
    sport: "City Football",
    timeAgo: "2 weeks ago",
    message: "Well organized match, everything was smooth. Would join again!",
    rating: 5,
  },
];

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [avatarMode, setAvatarMode] = useState<"url" | "upload">("upload");
  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: "",
    avatarUrl: "",
    bio: "",
    district: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.fullName ?? "",
      avatarUrl: user.avatarUrl ?? "",
      bio: user.bio ?? "",
      district: user.district ?? "",
      lat: toInputValue(user.lat),
      lng: toInputValue(user.lng),
    });
  }, [user]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(""), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const profileInitial = user?.fullName?.trim()?.charAt(0).toUpperCase() || "U";
  const isActive = user?.isActive !== false;
  const isBanned = user?.isBanned === true;

  const handleChange =
    (field: keyof ProfileFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setErrorMessage("");
      setSuccessMessage("");
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
        setErrorMessage("");
        setSuccessMessage("");
        setFormData((current) => ({
          ...current,
          avatarUrl: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

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
      setSuccessMessage("Cập nhật profile thành công.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật profile.";
      setErrorMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page profile-dashboard">
      <LoggedInNavbar />

      <main className="profile-shell">
        <div className="profile-frame container-fluid">
          <div className="profile-board">
            <section className="profile-content">
              <div className="profile-hero card-shell">
                <div className="profile-hero-banner" />
                <div className="profile-hero-bg" />
                <div className="profile-hero-top">
                  <div className="profile-avatar-rail">
                    <div className="profile-avatar-ring">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} />
                      ) : (
                        <span>{profileInitial}</span>
                      )}
                    </div>
                  </div>

                  <div className="profile-hero-info">
                    <div className="profile-name-row">
                      <div>
                        <h1 className="profile-hero-name">
                          {user?.fullName || "Unknown user"}
                        </h1>
                        <div className="profile-hero-location">
                          <i className="fa-solid fa-location-dot me-2" />
                          {user?.district || "Ho Chi Minh City, Vietnam"}
                        </div>
                        {user?.bio && (
                          <p className="profile-hero-bio">{user.bio}</p>
                        )}
                      </div>

                      <div className="profile-hero-actions">
                        <button
                          type="button"
                          className="btn btn-primary profile-main-btn"
                          onClick={() => {
                            setSuccessMessage("");
                            setErrorMessage("");
                            setIsEditing((current) => !current);
                          }}
                        >
                          <i className="fa-regular fa-pen-to-square me-2" />
                          {isEditing ? "Close editor" : "Edit profile"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-light profile-secondary-btn"
                        >
                          <i className="fa-regular fa-paper-plane me-2" />
                          Message
                        </button>
                      </div>
                    </div>

                    <div className="profile-tags">
                      <span className="profile-pill">Football</span>
                      <span className="profile-pill">Badminton</span>
                      <span className="profile-pill profile-pill-muted">
                        Active account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-panel card-shell profile-edit-panel profile-edit-panel-top">
                <div className="panel-heading">
                  <h3>Thông tin cá nhân</h3>
                </div>

                {isEditing ? (
                  <form className="profile-edit-form" onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Full name
                        </label>
                        <input
                          className="form-control profile-input"
                          value={formData.fullName}
                          onChange={handleChange("fullName")}
                          placeholder="Your full name"
                          maxLength={100}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Avatar</label>
                        <div className="d-flex gap-2 mb-2 flex-wrap">
                          <button
                            type="button"
                            className={`btn btn-sm ${avatarMode === "upload" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setAvatarMode("upload")}
                          >
                            Upload from device
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${avatarMode === "url" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setAvatarMode("url")}
                          >
                            Use URL
                          </button>
                        </div>

                        {avatarMode === "upload" ? (
                          <div className="avatar-upload-block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            {formData.avatarUrl && (
                              <div className="avatar-upload-preview mt-3">
                                <img
                                  src={formData.avatarUrl}
                                  alt="avatar preview"
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    setFormData((current) => ({
                                      ...current,
                                      avatarUrl: "",
                                    }))
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            className="form-control profile-input"
                            value={formData.avatarUrl}
                            onChange={handleChange("avatarUrl")}
                            placeholder="https://..."
                            maxLength={200}
                          />
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Bio</label>
                        <textarea
                          className="form-control profile-input"
                          rows={4}
                          value={formData.bio}
                          onChange={handleChange("bio")}
                          placeholder="Introduce yourself, preferred sports, and goals."
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          District
                        </label>
                        <input
                          className="form-control profile-input"
                          value={formData.district}
                          onChange={handleChange("district")}
                          placeholder="District / area"
                          maxLength={60}
                        />
                      </div>

                      {errorMessage && (
                        <div className="col-12">
                          <div className="alert alert-danger mb-0 profile-alert">
                            {errorMessage}
                          </div>
                        </div>
                      )}

                      {successMessage && (
                        <div className="col-12">
                          <div className="alert alert-success mb-0 profile-alert">
                            {successMessage}
                          </div>
                        </div>
                      )}

                      <div className="col-12 d-flex flex-wrap gap-2 pt-1">
                        <button
                          className="btn btn-primary profile-main-btn"
                          type="submit"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          className="btn btn-outline-secondary profile-secondary-btn"
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setSuccessMessage("");
                            setErrorMessage("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="profile-info-list">
                    <div className="profile-info-row">
                      <span>
                        <i className="fa-solid fa-envelope profile-info-icon" />
                        Email
                      </span>
                      <strong>{user?.email || "-"}</strong>
                    </div>
                    <div className="profile-info-row">
                      <span>
                        <i className="fa-solid fa-shield-halved profile-info-icon" />
                        Vai trò
                      </span>
                      <strong>{user?.role || "-"}</strong>
                    </div>
                    <div className="profile-info-row">
                      <span>
                        <i className="fa-solid fa-quote-left profile-info-icon" />
                        Bio
                      </span>
                      <strong>{user?.bio || "Chưa có mô tả"}</strong>
                    </div>
                    <div className="profile-info-row">
                      <span>
                        <i className="fa-solid fa-location-dot profile-info-icon" />
                        Quận/Huyện
                      </span>
                      <strong>{user?.district || "Chưa cập nhật"}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="profile-stats-grid">
                {STAT_CARDS.map((stat) => (
                  <div
                    className="profile-stat card-shell"
                    key={stat.label}
                    style={{ borderTop: `3px solid ${stat.color}` }}
                  >
                    <i
                      className={`${stat.icon} profile-stat-icon`}
                      style={{ color: stat.color }}
                    />
                    <div className="profile-stat-value">{stat.value}</div>
                    <div className="profile-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="profile-grid-two">
                <div className="profile-panel card-shell">
                  <div className="panel-heading">
                    <h3>Skill Levels</h3>
                    <span className="panel-meta">Training snapshot</span>
                  </div>
                  <div className="skill-chips-grid">
                    {SKILL_LEVELS.map((skill) => (
                      <div
                        className={`skill-chip skill-chip--tier-${skill.tier}`}
                        key={skill.label}
                      >
                        <span className="skill-chip-sport">
                          <span className="skill-chip-emoji">
                            {skill.emoji}
                          </span>
                          {skill.label}
                        </span>
                        <div className="skill-chip-right">
                          <span className="skill-chip-dots">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span
                                key={i}
                                className={`skill-dot${i < skill.tier ? " skill-dot--filled" : ""}`}
                              />
                            ))}
                          </span>
                          <span className="skill-chip-level">
                            {skill.level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="profile-panel card-shell">
                  <div className="panel-heading">
                    <h3>Badges Earned</h3>
                    <span className="panel-meta">Consistency wins</span>
                  </div>
                  <div className="badge-strip">
                    {BADGES.map((badge) => (
                      <div
                        className={`earned-badge ${badge.active ? "active" : ""}`}
                        key={badge.title}
                      >
                        <i className={badge.icon} />
                        <span>{badge.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="warning-card">
                    <div className="warning-title">
                      <i className="fa-regular fa-flag me-2" />
                      Attendance Warning
                    </div>
                    <div className="warning-text">
                      This edge appears when attendance drops below 75%.
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-grid-two mt-4">
                <div className="profile-panel card-shell">
                  <div className="panel-heading mb-3">
                    <h3>Reviews</h3>
                    <span className="panel-meta">What people say</span>
                  </div>

                  <div className="review-tabs">
                    <button type="button" className="review-tab active">
                      As Player
                    </button>
                    <button type="button" className="review-tab">
                      As Host
                    </button>
                  </div>

                  <div className="review-list">
                    {REVIEWS.map((review) => (
                      <article className="review-card" key={review.name}>
                        <div className="review-topline">
                          <div>
                            <div className="review-name">{review.name}</div>
                            <div className="review-meta">
                              {review.sport} • {review.timeAgo}
                            </div>
                          </div>
                          <div
                            className="review-rating"
                            aria-label={`${review.rating} stars`}
                          >
                            {Array.from({ length: 5 }).map((_, index) => (
                              <i
                                key={index}
                                className={`fa-star ${index < review.rating ? "fa-solid" : "fa-regular"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="review-text">{review.message}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

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
