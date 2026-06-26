import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import LoggedInNavbar from "../../components/LoggedInNavbar/LoggedInNavbar";
import "./Messages.css";

import { chatService } from "../../services/chatService";
import type { RoomSummaryDto, MessageDto } from "../../services/chatService";
import { authService } from "../../services/authService";
import { useWebSocket } from "../../hooks/useWebSocket";
import SplitBillModal from "../../components/SplitBillModal/SplitBillModal";
import SplitBillCard from "../../components/SplitBillCard/SplitBillCard";
import BillDetailPanel from "../../components/BillDetailPanel/BillDetailPanel";
import RoomSidebar from "../../components/RoomSidebar/RoomSidebar";
import type { SplitBillDto } from "../../services/splitBillService";
import { useQueryClient } from "@tanstack/react-query";
import { useChatRoomsQuery, useChatMessagesQuery, chatKeys } from "../../hooks/useChatQueries";
import ChatListSkeleton from "../../components/Skeletons/ChatListSkeleton";
import { useNotifications } from "../../context/NotificationContext";

const Messages: React.FC = () => {

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"GROUP" | "DIRECT">("GROUP");
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [isMobileChatActive, setIsMobileChatActive] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [showSplitBillModal, setShowSplitBillModal] = useState<boolean>(false);
  const [showBillDetail, setShowBillDetail] = useState<boolean>(false);
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const activeCardUpdateRef = useRef<((bill: SplitBillDto) => void) | null>(null);
  const [completedBills, setCompletedBills] = useState<Record<number, boolean>>({});
  const [showRoomSidebar, setShowRoomSidebar] = useState<boolean>(false);

  const { notifications, markAsRead } = useNotifications();

  // Quản lý trạng thái chưa đọc thủ công khi có tin nhắn mới qua WebSocket
  const [unreadRooms, setUnreadRooms] = useState<Record<number, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Tải danh sách phòng chat sử dụng React Query hook
  const { data: rooms = [], isLoading: isRoomsLoading } = useChatRoomsQuery();

  // 2. Tải lịch sử tin nhắn phòng đang chọn sử dụng React Query hook
  const { data: activeRoomMessages = [] } = useChatMessagesQuery(
    selectedConvoId || 0,
    !!selectedConvoId
  );

  useEffect(() => {
    authService.getProfile()
      .then(user => setUserId(user.id))
      .catch(err => console.error("Không thể lấy thông tin người dùng:", err));
  }, []);

  // Khởi tạo trạng thái chấm đỏ chưa đọc từ danh sách thông báo đã lưu
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadMap: Record<number, boolean> = {};
      notifications.forEach((notif) => {
        if (notif.type === "NEW_MESSAGE" && !notif.isRead && notif.relatedEntityId) {
          unreadMap[notif.relatedEntityId] = true;
        }
      });
      setUnreadRooms((prev) => ({ ...unreadMap, ...prev }));
    }
  }, [notifications]);

  // Đồng bộ hóa chấm đỏ chưa đọc và đẩy phòng chat lên đầu khi có tin nhắn mới
  useEffect(() => {
    const latestNotif = notifications[0];
    if (latestNotif && latestNotif.type === "NEW_MESSAGE" && !latestNotif.isRead) {
      const roomId = latestNotif.relatedEntityId;
      if (roomId && roomId !== selectedConvoId) {
        setUnreadRooms((prev) => ({ ...prev, [roomId]: true }));

        // Cập nhật cache để đẩy phòng chat lên đầu danh sách phòng
        queryClient.setQueryData<RoomSummaryDto[]>(chatKeys.rooms(), (oldRooms) => {
          if (!oldRooms) return oldRooms;
          return oldRooms.map((r) => {
            if (r.id === roomId) {
              return { ...r, lastMessageAt: latestNotif.createdAt };
            }
            return r;
          });
        });
      }
    }
  }, [notifications, selectedConvoId, queryClient]);

  // Tự động đánh dấu đã đọc các thông báo tin nhắn của phòng đang xem
  useEffect(() => {
    if (selectedConvoId && notifications.length > 0) {
      notifications.forEach((notif) => {
        if (notif.type === "NEW_MESSAGE" && notif.relatedEntityId === selectedConvoId && !notif.isRead) {
          markAsRead(notif.id);
        }
      });
    }
  }, [selectedConvoId, notifications, markAsRead]);

  // Xử lý sự kiện nhận tin nhắn mới từ WebSocket
  const handleNewMessage = useCallback((newMsg: MessageDto) => {
    if (newMsg.type === "FEE_SPLIT" && newMsg.metadata) {
      try {
        const meta = JSON.parse(newMsg.metadata);
        if (meta.status === "COMPLETED" && meta.billId) {
          setCompletedBills(prev => ({ ...prev, [meta.billId]: true }));
        }
      } catch (e) {
        // bỏ qua
      }
    }

    // Cập nhật cache React Query cho danh sách tin nhắn của phòng
    queryClient.setQueryData<MessageDto[]>(chatKeys.messages(newMsg.roomId), (oldMessages) => {
      // Đọc fallback từ local cache của service nếu query cache chưa có
      const fallbackMsgs = oldMessages || chatService.getCachedRoomMessages(newMsg.roomId) || [];
      const exists = fallbackMsgs.some(m => m.id === newMsg.id);
      if (exists) return fallbackMsgs;
      return [...fallbackMsgs, newMsg];
    });

    // Cập nhật cache React Query cho danh sách phòng chat (cập nhật thời gian tin nhắn mới nhất)
    queryClient.setQueryData<RoomSummaryDto[]>(chatKeys.rooms(), (oldRooms) => {
      const fallbackRooms = oldRooms || rooms;
      return fallbackRooms.map(r => {
        if (r.id === newMsg.roomId) {
          return {
            ...r,
            lastMessageAt: newMsg.createdAt
          };
        }
        return r;
      });
    });

    // Đánh dấu chưa đọc nếu tin nhắn thuộc về phòng khác
    if (newMsg.roomId !== selectedConvoId) {
      setUnreadRooms(prev => ({ ...prev, [newMsg.roomId]: true }));
    }

    if (newMsg.roomId === selectedConvoId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedConvoId, queryClient, rooms]);

  const { sendMessage, isConnected } = useWebSocket(selectedConvoId, handleNewMessage);

  // Sync selectedConvoId từ URL query param
  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    if (roomIdParam && rooms.length > 0) {
      const parsedId = parseInt(roomIdParam);
      if (selectedConvoId !== parsedId) {
        const exists = rooms.find((c) => c.id === parsedId);
        if (exists) {
          setSelectedConvoId(parsedId);
          setActiveTab(exists.type as any);
          setIsMobileChatActive(true);
        }
      }
    }
  }, [searchParams, rooms, selectedConvoId]);

  // Cuộn xuống cuối khi chuyển phòng chat hoặc nhận tin nhắn mới trong hook
  useEffect(() => {
    if (selectedConvoId && activeRoomMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedConvoId, activeRoomMessages]);

  const activeConvo = useMemo(() => {
    if (!selectedConvoId) return null;
    const room = rooms.find(r => r.id === selectedConvoId);
    if (!room) return null;

    const cachedMsgs = queryClient.getQueryData<MessageDto[]>(chatKeys.messages(selectedConvoId)) 
      || chatService.getCachedRoomMessages(selectedConvoId) 
      || [];

    return {
      ...room,
      messages: cachedMsgs,
      hasUnread: !!unreadRooms[selectedConvoId]
    };
  }, [rooms, selectedConvoId, unreadRooms, queryClient, activeRoomMessages]);

  const isHost = activeConvo && userId !== null && activeConvo.createdBy === userId;

  const filteredConversations = useMemo(() => {
    return rooms
      .filter((convo) => {
        const matchesTab = convo.type === activeTab;
        const matchesSearch =
          convo.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .map((convo) => {
        const cachedMsgs = queryClient.getQueryData<MessageDto[]>(chatKeys.messages(convo.id)) 
          || chatService.getCachedRoomMessages(convo.id) 
          || [];
        return {
          ...convo,
          messages: cachedMsgs,
          hasUnread: !!unreadRooms[convo.id]
        };
      })
      .sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [rooms, activeTab, searchQuery, unreadRooms, queryClient, activeRoomMessages]);

  const handleSelectConvo = (id: number) => {
    setSelectedConvoId(id);
    setIsMobileChatActive(true);
    setShowRoomSidebar(false);
    
    // Đánh dấu đã đọc cho phòng này
    setUnreadRooms((prev) => ({ ...prev, [id]: false }));

    const selected = rooms.find((c) => c.id === id);
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

      <main className="messages-main-content">
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
              {isRoomsLoading ? (
                <ChatListSkeleton />
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  Không tìm thấy hội thoại nào.
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const isSelected = convo.id === selectedConvoId;
                  const lastMsg = convo.messages[convo.messages.length - 1];
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
                          {lastMsg
                            ? lastMsg.type === "IMAGE"
                              ? "[Hình ảnh]"
                              : lastMsg.type === "FEE_SPLIT"
                              ? "[Hóa đơn chia tiền]"
                              : lastMsg.content
                            : "Chưa có tin nhắn"}
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
                    <button
                      className={`header-action-btn ${showRoomSidebar ? "active" : ""}`}
                      title="Tư liệu phòng"
                      onClick={() => setShowRoomSidebar(!showRoomSidebar)}
                    >
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

                    if (msg.type === "FEE_SPLIT") {
                      let billId = null;
                      try {
                        const metadata = JSON.parse(msg.metadata || "{}");
                        billId = metadata.billId;
                      } catch (err) {
                        console.error("Lỗi parse metadata hóa đơn:", err);
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
                              {billId ? (
                                <SplitBillCard
                                  billId={billId}
                                  currentUserId={userId || 0}
                                  isHost={isHost || false}
                                  isForceCompleted={!!completedBills[billId]}
                                  onViewDetail={(id, onUpdate) => {
                                    setSelectedBillId(id);
                                    activeCardUpdateRef.current = onUpdate;
                                    setShowBillDetail(true);
                                  }}
                                />
                              ) : (
                                <div className="msg-text-bubble">
                                  <p className="mb-0">Hóa đơn chia tiền bị lỗi dữ liệu.</p>
                                </div>
                              )}
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
                    {activeConvo.type === "GROUP" && isHost && (
                      <button
                        className="input-action-btn split-bill-btn"
                        onClick={() => setShowSplitBillModal(true)}
                        title="Chia tiền sân & chi phí"
                      >
                        <i className="fa-solid fa-file-invoice-dollar text-primary"></i>
                      </button>
                    )}
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

          {activeConvo && (
            <RoomSidebar
              isOpen={showRoomSidebar}
              onClose={() => setShowRoomSidebar(false)}
              roomId={activeConvo.id}
              roomName={activeConvo.name}
              messages={activeConvo.messages}
              onViewBill={(billId) => {
                setSelectedBillId(billId);
                activeCardUpdateRef.current = null;
                setShowBillDetail(true);
              }}
            />
          )}
        </div>
      </main>

      <SplitBillModal
        isOpen={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        roomId={selectedConvoId || 0}
        memberCount={activeConvo ? activeConvo.participantCount : 0}
        onCreated={() => { }}
      />

      {selectedBillId !== null && (
        <BillDetailPanel
          isOpen={showBillDetail}
          onClose={() => {
            setShowBillDetail(false);
            setSelectedBillId(null);
            activeCardUpdateRef.current = null;
          }}
          billId={selectedBillId}
          currentUserId={userId || 0}
          isHost={isHost || false}
          onBillUpdated={(updatedBill) => {
            if (activeCardUpdateRef.current) {
              activeCardUpdateRef.current(updatedBill);
            }
          }}
        />
      )}


    </div>
  );
};

export default Messages;
