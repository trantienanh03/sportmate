import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import LoggedInNavbar from "../../components/LoggedInNavbar/LoggedInNavbar";
import Footer from "../../components/Footer/Footer";
import "./Messages.css";

interface Message {
  id: number;
  senderId?: number;
  senderName?: string;
  senderAvatar?: string;
  isHost?: boolean;
  content?: string;
  timestamp: string;
  isMe?: boolean;
  status?: "sent" | "delivered" | "read";
  isSystem?: boolean;
  isCourtFeeSplit?: boolean;
  isDateSeparator?: boolean;
  courtFeeData?: {
    total: string;
    perPerson: string;
    qrText: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  sport?: string;
  avatarIcon?: string;
  avatarUrl?: string;
  participants: number;
  lastMessage: string;
  lastMessageSender?: string;
  timeLabel: string;
  hasUnread: boolean;
  type: "group" | "direct";
  detailsLabel?: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: "1",
    title: "Đá banh cuối tuần",
    sport: "football",
    avatarIcon: "fa-futbol",
    participants: 4,
    lastMessage: "Hẹn gặp mọi người ngày mai nha!",
    lastMessageSender: "Minh",
    timeLabel: "2 phút trước",
    hasUnread: true,
    type: "group",
    detailsLabel: "Thứ Năm, 20:00 · 4 người tham gia",
    messages: [
      {
        id: 100,
        isDateSeparator: true,
        content: "Thứ Năm, 7 tháng 6",
        timestamp: "",
      },
      {
        id: 1,
        isSystem: true,
        content: "Linh Nguyễn đã tham gia trận đấu",
        timestamp: "10:15 AM",
      },
      {
        id: 2,
        senderId: 101,
        senderName: "Linh N.",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
        content: "Chào mọi người! Mai chiến thôi, háo hức quá!",
        timestamp: "10:30 AM",
      },
      {
        id: 3,
        isMe: true,
        content: "Mình cũng vậy! Thời tiết ngày mai siêu đẹp luôn.",
        timestamp: "10:32 AM",
        status: "read",
      },
      {
        id: 4,
        isSystem: true,
        content: "Đức Phạm đã tham gia trận đấu",
        timestamp: "11:02 AM",
      },
      {
        id: 5,
        senderId: 102,
        senderName: "Đức P.",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
        content: "Mọi người hay đá vị trí nào vậy?",
        timestamp: "11:15 AM",
      },
      {
        id: 6,
        isMe: true,
        content: "Mình hay đá tiền vệ, nhưng vị trí nào cũng được!",
        timestamp: "11:18 AM",
        status: "read",
      },
      {
        id: 7,
        senderId: 103,
        senderName: "Minh T.",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
        isHost: true,
        content: "Mình sẽ mang bóng và thêm ít nước. Tiền sân tổng cộng là 200k, chia ra mỗi người 50k nhé.",
        timestamp: "2:00 PM",
      },
      {
        id: 8,
        senderId: 103,
        senderName: "Minh T.",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
        isHost: true,
        isCourtFeeSplit: true,
        courtFeeData: {
          total: "200.000 VND",
          perPerson: "50.000 VND",
          qrText: "[Mã QR Thanh Toán]",
        },
        timestamp: "2:01 PM",
      },
      {
        id: 101,
        isDateSeparator: true,
        content: "Hôm nay",
        timestamp: "",
      },
      {
        id: 9,
        senderId: 101,
        senderName: "Linh N.",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
        content: "Đã chuyển khoản nha! Xem ảnh xác nhận bên dưới nè",
        timestamp: "2:15 PM",
      },
      {
        id: 10,
        isMe: true,
        content: "Mình cũng vừa chuyển khoản rồi! Hẹn gặp mọi người ngày mai nhé!",
        timestamp: "2:20 PM",
        status: "delivered",
      },
      {
        id: 11,
        senderId: 103,
        senderName: "Minh T.",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
        isHost: true,
        content: "Hẹn gặp mọi người ngày mai nha!",
        timestamp: "2:25 PM",
      },
    ],
  },
  {
    id: "2",
    title: "Đánh cầu lông đôi",
    sport: "badminton",
    avatarIcon: "fa-table-tennis-paddle-ball",
    participants: 4,
    lastMessage: "Chia tiền sân: 50.000đ mỗi người",
    timeLabel: "10:30 AM",
    hasUnread: false,
    type: "group",
    detailsLabel: "Thứ Sáu, 19:00 · 4 người tham gia",
    messages: [
      {
        id: 100,
        isDateSeparator: true,
        content: "Thứ Sáu, 8 tháng 6",
        timestamp: "",
      },
      {
        id: 1,
        senderId: 104,
        senderName: "An K.",
        content: "Chào cả nhà, thứ 6 này mọi người sẵn sàng hết chưa?",
        timestamp: "9:00 AM",
      },
      {
        id: 2,
        isMe: true,
        content: "Dạ rồi, vợt của em đã sẵn sàng lâm trận!",
        timestamp: "9:15 AM",
        status: "read",
      },
      {
        id: 3,
        senderId: 105,
        senderName: "Vy L.",
        content: "Tiền sân chia ra 50k mỗi người nhé. Mình đã đặt trước sân số 3 rồi á.",
        timestamp: "10:30 AM",
      },
    ],
  },
  {
    id: "3",
    title: "Tennis sáng sớm",
    sport: "tennis",
    avatarIcon: "fa-baseball",
    participants: 4,
    lastMessage: "Có ai cần đi nhờ xe không?",
    timeLabel: "5 giờ trước",
    hasUnread: false,
    type: "group",
    detailsLabel: "Thứ Bảy, 06:00 · 4 người tham gia",
    messages: [
      {
        id: 100,
        isDateSeparator: true,
        content: "Thứ Bảy, 9 tháng 6",
        timestamp: "",
      },
      {
        id: 1,
        senderId: 106,
        senderName: "Trung D.",
        content: "Chào mọi người, vì trận đấu khá sớm (6:00 sáng) nên có ai cần đi nhờ xe không? Mình có thể đón quanh Quận 3.",
        timestamp: "Hôm qua",
      },
    ],
  },
  {
    id: "direct_1",
    title: "Linh Nguyễn",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    participants: 2,
    lastMessage: "Tuần sau mình cũng tham gia trận cầu lông nữa!",
    timeLabel: "Hôm qua",
    hasUnread: false,
    type: "direct",
    messages: [
      {
        id: 100,
        isDateSeparator: true,
        content: "Hôm qua",
        timestamp: "",
      },
      {
        id: 1,
        senderId: 101,
        senderName: "Linh Nguyễn",
        content: "Chào bạn! Tuần sau bạn có tổ chức trận đá bóng nào nữa không?",
        timestamp: "Hôm qua",
      },
      {
        id: 2,
        isMe: true,
        content: "Có chứ, chắc là chiều Chủ Nhật nè. Mình sẽ tạo phòng sớm thôi!",
        timestamp: "Hôm qua",
        status: "read",
      },
      {
        id: 3,
        senderId: 101,
        senderName: "Linh Nguyễn",
        content: "Tuyệt quá! Tuần sau mình cũng tham gia trận cầu lông nữa!",
        timestamp: "Hôm qua",
      },
    ],
  },
  {
    id: "direct_2",
    title: "Đức Phạm",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    participants: 2,
    lastMessage: "Hẹn gặp bạn ở sân bóng nhé!",
    timeLabel: "2 ngày trước",
    hasUnread: false,
    type: "direct",
    messages: [
      {
        id: 100,
        isDateSeparator: true,
        content: "2 ngày trước",
        timestamp: "",
      },
      {
        id: 1,
        senderId: 102,
        senderName: "Đức Phạm",
        content: "Alo b, mình có cần mang thêm áo pitch (áo lưới) sạch đi không?",
        timestamp: "2 ngày trước",
      },
      {
        id: 2,
        isMe: true,
        content: "Minh bảo chuẩn bị sẵn hết rồi á b, nhưng nếu mang thêm sơ cua thì càng tốt nha!",
        timestamp: "2 ngày trước",
        status: "read",
      },
      {
        id: 3,
        senderId: 102,
        senderName: "Đức Phạm",
        content: "Ok b, đã rõ. Hẹn gặp bạn ở sân bóng nhé!",
        timestamp: "2 ngày trước",
      },
    ],
  },
];

const Messages: React.FC = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeTab, setActiveTab] = useState<"group" | "direct">("group");
  const [selectedConvoId, setSelectedConvoId] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [isMobileChatActive, setIsMobileChatActive] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    if (roomIdParam) {
      const exists = conversations.find((c) => c.id === roomIdParam);
      if (exists) {
        setSelectedConvoId(roomIdParam);
        setActiveTab(exists.type);
        setIsMobileChatActive(true);
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConvoId, conversations]);

  const activeConvo = conversations.find((c) => c.id === selectedConvoId);

  const filteredConversations = conversations.filter((convo) => {
    const matchesTab = convo.type === activeTab;
    const matchesSearch =
      convo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelectConvo = (id: string) => {
    setSelectedConvoId(id);
    setIsMobileChatActive(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hasUnread: false } : c))
    );
    const selected = conversations.find((c) => c.id === id);
    if (selected && selected.type === "group") {
      setSearchParams({ roomId: id });
    } else {
      setSearchParams({});
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const newMessage: Message = {
      id: Date.now(),
      isMe: true,
      content: inputText,
      timestamp: timeString,
      status: "sent",
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConvoId) {
          return {
            ...c,
            lastMessage: inputText,
            lastMessageSender: "Tôi",
            timeLabel: "Vừa xong",
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    setInputText("");

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedConvoId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === newMessage.id ? { ...m, status: "read" as const } : m
              ),
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  const getSportIcon = (sport?: string) => {
    if (!sport) return "fa-comment";
    switch (sport.toLowerCase()) {
      case "football":
      case "soccer":
        return "fa-futbol";
      case "badminton":
        return "fa-table-tennis-paddle-ball";
      case "tennis":
        return "fa-baseball";
      case "basketball":
        return "fa-basketball";
      default:
        return "fa-futbol";
    }
  };

  return (
    <div className="messages-page-wrapper">
      <LoggedInNavbar />

      <main className="messages-main-content py-4 py-md-5">
        <div className="container">
          <div
            className={`messages-card-container ${
              isMobileChatActive ? "mobile-chat-active" : ""
            }`}
          >
            <section className="conversation-list-pane">
              <header className="pane-header">
                <div className="search-box-wrap">
                  <i className="fa-solid fa-magnifying-glass search-icon"></i>
                  <input
                    type="text"
                    className="search-input-field"
                    placeholder="Tìm kiếm hội thoại..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </header>

              <div className="pane-tabs">
                <button
                  className={`pane-tab-btn ${activeTab === "group" ? "active" : ""}`}
                  onClick={() => setActiveTab("group")}
                >
                  Trò chuyện nhóm
                </button>
                <button
                  className={`pane-tab-btn ${activeTab === "direct" ? "active" : ""}`}
                  onClick={() => setActiveTab("direct")}
                >
                  Tin nhắn cá nhân
                </button>
              </div>

              <div className="conversations-scroll-area">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-5 text-muted small">
                    Không tìm thấy hội thoại nào.
                  </div>
                ) : (
                  filteredConversations.map((convo) => {
                    const isSelected = convo.id === selectedConvoId;
                    return (
                      <div
                        key={convo.id}
                        className={`conversation-item ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelectConvo(convo.id)}
                      >
                        <div className="conversation-avatar-wrap">
                          {convo.avatarUrl ? (
                            <img src={convo.avatarUrl} alt={convo.title} />
                          ) : (
                            <i
                              className={`fa-solid ${getSportIcon(
                                convo.sport
                              )} conversation-avatar-icon`}
                            ></i>
                          )}
                        </div>

                        <div className="conversation-info">
                          <div className="convo-title-row">
                            <h4 className="convo-title">{convo.title}</h4>
                            <span className="convo-time">{convo.timeLabel}</span>
                          </div>
                          {convo.detailsLabel && (
                            <p className="convo-details">{convo.detailsLabel}</p>
                          )}
                          <p className="convo-last-msg">
                            {convo.lastMessageSender && (
                              <strong>{convo.lastMessageSender}: </strong>
                            )}
                            {convo.lastMessage}
                          </p>
                        </div>

                        <div className="convo-status-col">
                          {convo.hasUnread && <div className="unread-dot"></div>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <main className="chat-window-pane">
              {activeConvo ? (
                <>
                  <header className="chat-header">
                    <div className="chat-header-info">
                      <button
                        className="header-action-btn d-md-none me-2"
                        onClick={() => setIsMobileChatActive(false)}
                        title="Quay lại danh sách chat"
                      >
                        <i className="fa-solid fa-arrow-left"></i>
                      </button>

                      <div className="header-avatar">
                        {activeConvo.avatarUrl ? (
                          <img src={activeConvo.avatarUrl} alt={activeConvo.title} />
                        ) : (
                          <i className={`fa-solid ${getSportIcon(activeConvo.sport)}`}></i>
                        )}
                      </div>
                      <div className="header-text-details">
                        <h3 className="header-chat-title">{activeConvo.title}</h3>
                        <span className="header-chat-sub">
                          {activeConvo.type === "group"
                            ? `${activeConvo.participants} thành viên`
                            : "Đang hoạt động"}
                        </span>
                      </div>
                    </div>

                    <div className="chat-header-actions">
                      <button className="header-action-btn" title="Bắt đầu cuộc gọi thoại">
                        <i className="fa-solid fa-phone"></i>
                      </button>
                      <button className="header-action-btn" title="Bắt đầu cuộc gọi video">
                        <i className="fa-solid fa-video"></i>
                      </button>
                      <button className="header-action-btn" title="Tùy chọn khác">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  </header>

                  <div className="chat-messages-feed">
                    {activeConvo.messages.map((msg) => {
                      if (msg.isDateSeparator) {
                        return (
                          <div key={msg.id} className="date-divider-wrap">
                            <div className="date-divider-line"></div>
                            <span className="date-divider-text">{msg.content}</span>
                          </div>
                        );
                      }

                      if (msg.isSystem) {
                        return (
                          <div key={msg.id} className="system-msg-wrap">
                            <span className="system-msg-text">{msg.content}</span>
                          </div>
                        );
                      }

                      if (msg.isCourtFeeSplit && msg.courtFeeData) {
                        return (
                          <div key={msg.id} className="message-bubble-row received">
                            <div className="msg-sender-avatar">
                              {msg.senderAvatar ? (
                                <img src={msg.senderAvatar} alt={msg.senderName} />
                              ) : (
                                <span>{msg.senderName?.charAt(0)}</span>
                              )}
                            </div>
                            <div className="msg-bubble-content-col">
                              <span className="msg-sender-name host-badge">{msg.senderName}</span>
                              <div className="court-fee-card">
                                <div className="fee-card-badge-label">
                                  <i className="fa-solid fa-file-invoice-dollar me-1"></i> Yêu cầu chia tiền
                                </div>
                                <div className="fee-card-header">
                                  <span>💰 Chi phí sân đấu</span>
                                </div>
                                <div className="fee-card-details">
                                  <div className="fee-detail-row">
                                    <span className="fee-detail-label">Tổng cộng:</span>
                                    <span className="fee-detail-val">
                                      {msg.courtFeeData.total}
                                    </span>
                                  </div>
                                  <div className="fee-detail-row">
                                    <span className="fee-detail-label">
                                      Mỗi người:
                                    </span>
                                    <span className="fee-detail-val highlight">
                                      {msg.courtFeeData.perPerson}
                                    </span>
                                  </div>
                                </div>
                                <div className="fee-qr-box">
                                  {msg.courtFeeData.qrText}
                                </div>
                              </div>
                              <div className="msg-meta-row">
                                <span>{msg.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const bubbleClass = msg.isMe ? "sent" : "received";
                      return (
                        <div key={msg.id} className={`message-bubble-row ${bubbleClass}`}>
                          {!msg.isMe && (
                            <div className="msg-sender-avatar">
                              {msg.senderAvatar ? (
                                <img src={msg.senderAvatar} alt={msg.senderName} />
                              ) : (
                                <span>{msg.senderName?.charAt(0)}</span>
                              )}
                            </div>
                          )}
                          <div className="msg-bubble-content-col">
                            {!msg.isMe && (
                              <span
                                className={`msg-sender-name ${
                                  msg.isHost ? "host-badge" : ""
                                }`}
                              >
                                {msg.senderName}
                              </span>
                            )}
                            <div className="msg-text-bubble">
                              <p className="mb-0">{msg.content}</p>
                            </div>
                            <div className="msg-meta-row">
                              <span>{msg.timestamp}</span>
                              {msg.isMe && msg.status && (
                                <span className="msg-status-ticks-wrapper">
                                  {msg.status === "sent" && (
                                    <i className="fa-solid fa-check msg-status-ticks"></i>
                                  )}
                                  {msg.status === "delivered" && (
                                    <i className="fa-solid fa-check-double msg-status-ticks"></i>
                                  )}
                                  {msg.status === "read" && (
                                    <i className="fa-solid fa-check-double msg-status-ticks read"></i>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <footer className="chat-input-bar">
                    <div className="chat-input-actions-group">
                      <button className="input-action-btn" title="Thêm emoji">
                        <i className="fa-regular fa-face-smile"></i>
                      </button>
                      <button className="input-action-btn" title="Đính kèm ảnh hoặc tệp">
                        <i className="fa-regular fa-image"></i>
                      </button>
                    </div>

                    <div className="chat-input-divider"></div>

                    <form className="chat-input-form" onSubmit={handleSend}>
                      <input
                        type="text"
                        className="chat-text-input"
                        placeholder="Nhập tin nhắn..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      <button type="submit" className="chat-send-btn" title="Gửi tin nhắn">
                        <i className="fa-solid fa-paper-plane"></i>
                      </button>
                    </form>
                  </footer>
                </>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <i className="fa-solid fa-comment-dots fa-3x mb-3"></i>
                  <p>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
