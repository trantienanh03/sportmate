import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import LoggedInNavbar from "../../components/LoggedInNavbar/LoggedInNavbar";
import Footer from "../../components/Footer/Footer";
import "./Messages.css";

import { chatService } from "../../services/chatService";
import type { RoomSummaryDto, MessageDto } from "../../services/chatService";
import { authService } from "../../services/authService";
import { useWebSocket } from "../../hooks/useWebSocket";

interface ExtendedRoom extends RoomSummaryDto {
  messages: MessageDto[];
  hasUnread: boolean;
}

const Messages: React.FC = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ExtendedRoom[]>([]);
  const [activeTab, setActiveTab] = useState<"GROUP" | "DIRECT">("GROUP");
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [isMobileChatActive, setIsMobileChatActive] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authService.getProfile()
      .then(user => setUserId(user.id))
      .catch(err => console.error("Not authenticated:", err));

    chatService.getRooms()
      .then(rooms => {
        const extendedRooms: ExtendedRoom[] = rooms.map(r => ({
          ...r,
          messages: [],
          hasUnread: false
        }));
        setConversations(extendedRooms);
      })
      .catch(err => console.error("Failed to load rooms:", err));
  }, []);

  // Dùng useCallback để giữ nguyên tham chiếu của callback, tránh làm useWebSocket bị kích hoạt kết nối lại (reconnect) liên tục.
  const handleNewMessage = useCallback((newMsg: MessageDto) => {
    setConversations(prev => prev.map(c => {
      if (c.id === newMsg.roomId) {
        // Chống trùng lặp tin nhắn
        const exists = c.messages.find(m => m.id === newMsg.id);
        if (exists) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessageAt: newMsg.createdAt
        };
      }
      return c;
    }));

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const { sendMessage, isConnected } = useWebSocket(selectedConvoId, handleNewMessage);

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    if (roomIdParam && conversations.length > 0) {
      const parsedId = parseInt(roomIdParam);
      const exists = conversations.find((c) => c.id === parsedId);
      if (exists) {
        setSelectedConvoId(parsedId);
        setActiveTab(exists.type as any);
        setIsMobileChatActive(true);
      }
    }
  }, [searchParams, conversations]);
  // load message from DB
  useEffect(() => {
    if (selectedConvoId) {
      chatService.getMessages(selectedConvoId)
        .then(fetchedMessages => {
          const sorted = [...fetchedMessages].reverse();
          setConversations(prev => prev.map(c => {
            if (c.id !== selectedConvoId) return c;
            const existingIds = new Set(sorted.map(m => m.id));
            const newFromWs = c.messages.filter(m => !existingIds.has(m.id));
            const merged = [...sorted, ...newFromWs].sort((a, b) => a.id - b.id);
            return { ...c, messages: merged };
          }));
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        })
        .catch(err => console.error("Failed to load messages:", err));
    }
  }, [selectedConvoId]);

  const activeConvo = conversations.find((c) => c.id === selectedConvoId);

  const filteredConversations = conversations.filter((convo) => {
    const matchesTab = convo.type === activeTab;
    const matchesSearch =
      convo.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSelectConvo = (id: number) => {
    setSelectedConvoId(id);
    setIsMobileChatActive(true);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hasUnread: false } : c))
    );
    const selected = conversations.find((c) => c.id === id);
    if (selected && selected.type === "GROUP") {
      setSearchParams({ roomId: id.toString() });
    } else {
      setSearchParams({});
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvoId || !isConnected) return;

    sendMessage(inputText);
    setInputText("");
  };

  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    if (isSameDay(date, today)) return "Hôm nay";
    if (isSameDay(date, yesterday)) return "Hôm qua";
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const getDateKey = (dateStr: string): string => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
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
            className={`messages-card-container ${isMobileChatActive ? "mobile-chat-active" : ""
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
                  className={`pane-tab-btn ${activeTab === "GROUP" ? "active" : ""}`}
                  onClick={() => setActiveTab("GROUP")}
                >
                  Trò chuyện nhóm
                </button>
                <button
                  className={`pane-tab-btn ${activeTab === "DIRECT" ? "active" : ""}`}
                  onClick={() => setActiveTab("DIRECT")}
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
                          <i
                            className={`fa-solid ${getSportIcon(
                              "football"
                            )} conversation-avatar-icon`}
                          ></i>
                        </div>

                        <div className="conversation-info">
                          <div className="convo-title-row">
                            <h4 className="convo-title">{convo.name}</h4>
                            <span className="convo-time">
                              {convo.lastMessageAt
                                ? new Date(convo.lastMessageAt).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : ""}
                            </span>
                          </div>
                          {convo.type === "GROUP" && (
                            <p className="convo-details">{convo.participantCount} người tham gia</p>
                          )}
                          <p className="convo-last-msg">
                            Chưa có tin nhắn
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
                        <i className={`fa-solid ${getSportIcon("football")}`}></i>
                      </div>
                      <div className="header-text-details">
                        <h3 className="header-chat-title">{activeConvo.name}</h3>
                        <span className="header-chat-sub">
                          {activeConvo.type === "GROUP"
                            ? `${activeConvo.participantCount} thành viên`
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
                    {activeConvo.messages.map((msg, index) => {
                      const prevMsg = activeConvo.messages[index - 1];
                      const showDateSeparator =
                        !prevMsg ||
                        getDateKey(msg.createdAt) !== getDateKey(prevMsg.createdAt);

                      if (msg.type === "SYSTEM") {
                        return (
                          <React.Fragment key={msg.id}>
                            {showDateSeparator && (
                              <div className="date-divider-wrap">
                                <div className="date-divider-line" />
                                <span className="date-divider-text">
                                  {formatDateLabel(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className="system-msg-wrap">
                              <span className="system-msg-text">{msg.content}</span>
                            </div>
                          </React.Fragment>
                        );
                      }

                      const isMe = userId !== null && msg.senderId === userId;
                      const bubbleClass = isMe ? "sent" : "received";

                      return (
                        <React.Fragment key={msg.id}>
                          {showDateSeparator && (
                            <div className="date-divider-wrap">
                              <div className="date-divider-line" />
                              <span className="date-divider-text">
                                {formatDateLabel(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <div className={`message-bubble-row ${bubbleClass}`}>
                            {!isMe && (
                              <div className="msg-sender-avatar">
                                {msg.senderAvatar ? (
                                  <img src={msg.senderAvatar} alt={msg.senderName} />
                                ) : (
                                  <span>{msg.senderName?.charAt(0)}</span>
                                )}
                              </div>
                            )}
                            <div className="msg-bubble-content-col">
                              {!isMe && (
                                <span className="msg-sender-name">
                                  {msg.senderName}
                                </span>
                              )}
                              <div className="msg-text-bubble">
                                <p className="mb-0">{msg.content}</p>
                              </div>
                              <div className="msg-meta-row">
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
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
