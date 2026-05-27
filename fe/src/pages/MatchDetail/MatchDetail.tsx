import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LoggedInNavbar from "../../components/LoggedInNavbar/LoggedInNavbar";
import {
  matchService,
  type MatchDetail as MatchDetailType,
} from "../../services/matchService";
import { useAuth } from "../../context/AuthContext";
import "./MatchDetail.css";

/* ── helpers ────────────────────────────────────────── */
const SPORT_ICONS: Record<string, string> = {
  football: "⚽",
  soccer: "⚽",
  basketball: "🏀",
  badminton: "🏸",
  tennis: "🎾",
  volleyball: "🏐",
  pickleball: "🏓",
  running: "🏃",
  swimming: "🏊",
  default: "🏅",
};
const getSportIcon = (sport: string) =>
  SPORT_ICONS[sport.toLowerCase()] ?? SPORT_ICONS.default;

const SPORT_BG: Record<string, string> = {
  football: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)",
  soccer: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)",
  basketball: "linear-gradient(135deg,#1c0a00 0%,#7c2d12 60%,#1c0a00 100%)",
  badminton: "linear-gradient(135deg,#030712 0%,#0e1b33 60%,#030712 100%)",
  tennis: "linear-gradient(135deg,#052e16 0%,#14532d 60%,#052e16 100%)",
  volleyball: "linear-gradient(135deg,#1e1b4b 0%,#3730a3 60%,#1e1b4b 100%)",
  pickleball: "linear-gradient(135deg,#0c0a09 0%,#292524 60%,#0c0a09 100%)",
  default: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)",
};
const getSportBg = (sport: string) =>
  SPORT_BG[sport.toLowerCase()] ?? SPORT_BG.default;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (start: string, end?: string) => {
  const fmt = (s: string) =>
    new Date(s).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  return end ? `${fmt(start)} — ${fmt(end)}` : fmt(start);
};

/* ── component ──────────────────────────────────────── */
const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    matchService
      .getMatch(Number(id))
      .then(setMatch)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      setMatch(await matchService.join(match.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to join");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!match) return;
    setActionLoading(true);
    try {
      setMatch(await matchService.leave(match.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to leave");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="md-page">
        <LoggedInNavbar />
        <div className="md-center-state">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );

  if (error || !match)
    return (
      <div className="md-page">
        <LoggedInNavbar />
        <div className="md-center-state md-error-text">
          {error ?? "Match not found"}
        </div>
      </div>
    );

  const spotsLeft = match.maxPlayers - match.currentPlayers;
  const fillPct = Math.min(
    100,
    Math.round((match.currentPlayers / match.maxPlayers) * 100),
  );
  const isHost = user?.id === match.host.id;
  const priceLabel =
    match.feePerPerson === 0
      ? "Free"
      : `${match.feePerPerson.toLocaleString("vi-VN")} VND / person`;
  const skillLabel =
    match.skillLevel.charAt(0).toUpperCase() + match.skillLevel.slice(1);

  return (
    <div className="md-page">
      <LoggedInNavbar />

      {/* ── Hero ──────────────────────────────── */}
      <div className="md-hero" style={{ background: getSportBg(match.sport) }}>
        <div className="md-hero-inner">
          <span className="md-sport-icon">{getSportIcon(match.sport)}</span>
          {match.status === "open" && (
            <span className="md-available-badge">
              <span className="md-dot" /> Available
            </span>
          )}
          <h1 className="md-hero-title">{match.title.toUpperCase()}</h1>
        </div>
      </div>

      {/* ── Body ──────────────────────────────── */}
      <div className="container-xl md-body">
        <div className="row g-4">
          {/* ── Left column ───────────────────── */}
          <div className="col-lg-8">
            {/* Host card */}
            <div className="md-card md-anim-1">
              <div className="md-host-row">
                <div className="md-avatar md-avatar--lg">
                  {match.host.avatarUrl ? (
                    <img src={match.host.avatarUrl} alt={match.host.fullName} />
                  ) : (
                    <span>{match.host.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="md-host-name">{match.host.fullName}</div>
                  <div className="md-stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i
                        key={i}
                        className="fa-solid fa-star"
                        style={{
                          color: i <= 4 ? "#f59e0b" : "#e2e8f0",
                          fontSize: "13px",
                        }}
                      />
                    ))}
                    <span className="md-rating-text">4.8 (23 reviews)</span>
                  </div>
                  <div className="md-host-meta">
                    Organized {match.currentPlayers} matches
                    <span className="md-sep">·</span>
                    96% attendance
                  </div>
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="md-card md-anim-2">
              <h3 className="md-section-title">Match Details</h3>
              <div className="md-detail-list">
                <div className="md-detail-row">
                  <div className="md-detail-icon">
                    <i className="fa-regular fa-calendar" />
                  </div>
                  <div>
                    <div className="md-detail-primary">
                      {formatDate(match.startTime)}
                    </div>
                    <div className="md-detail-secondary">
                      {formatTime(match.startTime, match.endTime)}
                    </div>
                  </div>
                </div>
                <div className="md-detail-row">
                  <div className="md-detail-icon">
                    <i className="fa-solid fa-location-dot" />
                  </div>
                  <div>
                    <div className="md-detail-primary">
                      {match.venue?.name ?? match.locationText ?? "TBD"}
                    </div>
                    {(match.venue?.address ?? match.locationText) && (
                      <div className="md-detail-secondary">
                        {match.venue?.address ?? match.locationText}
                      </div>
                    )}
                    {match.venue?.googleMapsUrl && (
                      <a
                        href={match.venue.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="md-dir-link"
                      >
                        Get Directions
                        <i
                          className="fa-solid fa-arrow-up-right-from-square ms-1"
                          style={{ fontSize: "9px" }}
                        />
                      </a>
                    )}
                  </div>
                </div>
                <div className="md-detail-row">
                  <div className="md-detail-icon">
                    <i className="fa-solid fa-dollar-sign" />
                  </div>
                  <div className="md-detail-primary">{priceLabel}</div>
                </div>
                <div className="md-detail-row">
                  <div className="md-detail-icon">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                  <div className="md-detail-primary">Level: {skillLabel}</div>
                </div>
              </div>
              {match.description && (
                <p className="md-description">{match.description}</p>
              )}
            </div>

            {/* Who's joining */}
            <div className="md-card md-anim-3">
              <div className="md-row-between mb-3">
                <h3 className="md-section-title" style={{ margin: 0 }}>
                  Who's joining ({match.currentPlayers}/{match.maxPlayers})
                </h3>
                <i className="fa-solid fa-user-group text-muted" />
              </div>
              <div className="md-participants">
                {match.participants.length === 0 && (
                  <p className="text-muted small mb-0">No participants yet.</p>
                )}
                {match.participants.map((p, i) => (
                  <div
                    className="md-participant"
                    key={p.userId}
                    style={{ animationDelay: `${0.08 * i}s` }}
                  >
                    <div className="md-avatar md-avatar--md">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt={p.fullName} />
                      ) : (
                        <span>{p.fullName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="md-participant-name">
                      {p.fullName.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discussion */}
            <div className="md-card md-anim-4">
              <div className="md-row-between mb-3">
                <h3 className="md-section-title" style={{ margin: 0 }}>
                  Discussion
                </h3>
                <i className="fa-regular fa-comment-dots text-muted" />
              </div>
              <div className="md-discussion">
                <div className="md-avatar md-avatar--sm">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} />
                  ) : (
                    <span>
                      {user?.fullName?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <div className="md-discussion-body">
                  <textarea
                    className="md-textarea"
                    placeholder="Ask something about this match…"
                    rows={2}
                  />
                  <div className="text-end mt-2">
                    <button className="md-post-btn">Post</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ──────────────────── */}
          <div className="col-lg-4">
            <div className="md-sidebar md-anim-2">
              {/* Spots */}
              <div className="md-spots-header">
                <span className="md-spots-label">
                  {match.currentPlayers} / {match.maxPlayers} spots filled
                </span>
                <span className="md-spots-pct">{fillPct}%</span>
              </div>
              <div className="md-progress-track">
                <div
                  className="md-progress-fill"
                  style={{ width: `${fillPct}%` }}
                />
              </div>

              {/* Action */}
              <div className="mt-4">
                {isHost ? (
                  <div className="md-host-badge">
                    <i className="fa-solid fa-crown me-2" />
                    You're the host
                  </div>
                ) : match.joined ? (
                  <button
                    className="md-leave-btn"
                    onClick={handleLeave}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "…" : "Leave Match"}
                  </button>
                ) : (
                  <>
                    <button
                      className="md-join-btn"
                      onClick={handleJoin}
                      disabled={actionLoading || spotsLeft === 0}
                    >
                      {actionLoading ? "…" : "JOIN THIS MATCH"}
                    </button>
                    {spotsLeft === 0 && (
                      <button className="md-waitlist-btn mt-2">
                        Join Waitlist
                      </button>
                    )}
                  </>
                )}
              </div>

              {!isHost && (
                <button className="md-report-btn">
                  <i className="fa-regular fa-flag me-1" /> Report fake match
                </button>
              )}

              {/* Safety tip */}
              <div className="md-safety">
                <i className="fa-solid fa-circle-check md-safety-icon" />
                <p className="md-safety-text">
                  <strong>Safety tip:</strong> Never transfer money directly to
                  hosts. Use our secure split fee feature.
                </p>
              </div>

              <hr className="md-hr" />

              <button className="md-share-btn">
                <i className="fa-solid fa-arrow-up-from-bracket me-2" />
                Share Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
