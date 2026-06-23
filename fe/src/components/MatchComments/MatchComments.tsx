import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { matchService, type MatchComment } from '../../services/matchService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './MatchComments.css';

const WS_URL = "http://localhost:8080/ws";

interface MatchCommentsProps {
  matchId: number;
}

const MatchComments: React.FC<MatchCommentsProps> = ({ matchId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  // Reply state
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const [popup, setPopup] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    fetchComments();

    // WebSocket Connection
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {},
      debug: () => {}, // Disable debug logs in production
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/match/${matchId}/comments`, (message) => {
        if (message.body) {
          const payload = JSON.parse(message.body);
          handleWebSocketMessage(payload);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP Error:", frame.headers["message"]);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [matchId]);

  const handleWebSocketMessage = (payload: any) => {
    const { type, data, commentId, parentId } = payload;
    
    setComments((prev) => {
      const updated = [...prev];
      
      switch (type) {
        case 'CREATE':
          if (!data.parentId) {
            // New top-level comment
            const exists = updated.some(c => c.id === data.id);
            if (!exists) updated.unshift(data);
          } else {
            // New reply
            return updated.map(c => {
              if (c.id === data.parentId) {
                const replies = c.replies || [];
                const exists = replies.some(r => r.id === data.id);
                return exists ? c : { ...c, replies: [...replies, data] };
              }
              return c;
            });
          }
          break;
          
        case 'UPDATE':
          if (!data.parentId) {
            return updated.map(c => c.id === data.id ? { ...c, ...data, replies: c.replies } : c);
          } else {
            return updated.map(c => {
              if (c.id === data.parentId) {
                const replies = (c.replies || []).map(r => r.id === data.id ? { ...r, ...data } : r);
                return { ...c, replies };
              }
              return c;
            });
          }
          
        case 'DELETE':
          if (!parentId) {
            return updated.filter(c => c.id !== commentId);
          } else {
            return updated.map(c => {
              if (c.id === parentId) {
                return { ...c, replies: (c.replies || []).filter(r => r.id !== commentId) };
              }
              return c;
            });
          }
      }
      return updated;
    });
  };

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await matchService.getComments(matchId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setIsSubmitting(true);
      await matchService.addComment(matchId, newComment.trim());
      // No need to manually update state, websocket will handle it
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      setPopup({ type: 'error', message: 'Không thể đăng bình luận. Vui lòng thử lại.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim() || !user) return;
    try {
      setIsSubmitting(true);
      await matchService.addComment(matchId, replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingToId(null);
    } catch (error) {
      console.error('Failed to reply:', error);
      setPopup({ type: 'error', message: 'Không thể trả lời bình luận.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (commentId: number) => {
    setConfirmDeleteId(commentId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await matchService.deleteComment(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setPopup({ type: 'error', message: 'Không thể xóa bình luận.' });
      setConfirmDeleteId(null);
    }
  };

  const handleEditStart = (comment: MatchComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setReplyingToId(null);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleEditSubmit = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      await matchService.updateComment(commentId, matchId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
      setPopup({ type: 'error', message: 'Không thể sửa bình luận.' });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: MatchComment, isReply = false) => {
    return (
      <div key={comment.id} className={`comment-item ${isReply ? 'reply-item' : ''}`}>
        {comment.userAvatarUrl ? (
          <img src={comment.userAvatarUrl} alt={comment.userName} className="comment-avatar" />
        ) : (
          <div className="comment-avatar-placeholder">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-author">{comment.userName}</span>
            <span className="comment-time">{formatDate(comment.createdAt)}</span>
          </div>
          {editingCommentId === comment.id ? (
            <div className="mt-2">
              <textarea
                className="form-control mb-2"
                rows={2}
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
              />
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-success" onClick={() => handleEditSubmit(comment.id)}>Lưu</button>
                <button className="btn btn-sm btn-secondary" onClick={handleEditCancel}>Hủy</button>
              </div>
            </div>
          ) : (
            <>
              <div className="comment-text">{comment.content}</div>
              <div className="d-flex gap-3 mt-1 align-items-center">
                {!isReply && user && (
                  <button 
                    className="comment-action-btn font-weight-bold"
                    onClick={() => {
                      setReplyingToId(replyingToId === comment.id ? null : comment.id);
                      setEditingCommentId(null);
                    }}
                  >
                    Trả lời
                  </button>
                )}
                {user && user.id === comment.userId && (
                  <>
                    <button 
                      className="comment-action-btn text-primary"
                      onClick={() => handleEditStart(comment)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="comment-action-btn text-danger"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Render Reply Input Box if replying to this top-level comment */}
          {replyingToId === comment.id && !isReply && (
            <div className="reply-input-area mt-3">
              <div className="d-flex gap-2">
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder={`Trả lời ${comment.userName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  disabled={isSubmitting}
                />
                <button 
                  className="btn btn-success" 
                  onClick={() => handleReplySubmit(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  Gửi
                </button>
              </div>
            </div>
          )}

          {/* Render Nested Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="replies-list mt-3">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="match-comments-section">
      <h3 className="match-comments-title">Bình luận trận đấu</h3>
      
      {user ? (
        <form className="comment-input-area mb-4" onSubmit={handleSubmit}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="comment-avatar" />
          ) : (
            <div className="comment-avatar-placeholder">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <textarea
            className="comment-input"
            placeholder="Viết bình luận mới..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            className="comment-submit-btn"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi'}
          </button>
        </form>
      ) : (
        <div className="comments-empty mb-4">Bạn cần đăng nhập để bình luận.</div>
      )}

      {isLoading ? (
        <div className="comments-loading">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => renderComment(comment, false))}
        </div>
      )}

      {/* Popups */}
      {confirmDeleteId && (
        <div className="md-popup-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="md-popup-card" onClick={(event) => event.stopPropagation()}>
            <h5 className="md-popup-title">Xác nhận xóa</h5>
            <p className="md-popup-message">Bạn có chắc chắn muốn xóa bình luận này?</p>
            <div className="md-popup-actions">
              <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setConfirmDeleteId(null)}>
                Hủy
              </button>
              <button className="btn btn-danger rounded-pill px-4" onClick={handleConfirmDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {popup && (
        <div className="md-popup-overlay" onClick={() => setPopup(null)}>
          <div className="md-popup-card" onClick={(event) => event.stopPropagation()}>
            <h5 className={`md-popup-title ${popup.type === 'error' ? 'text-danger' : 'text-success'}`}>
              {popup.type === 'error' ? 'Có lỗi xảy ra' : 'Thông báo'}
            </h5>
            <p className="md-popup-message">{popup.message}</p>
            <div className="md-popup-actions md-popup-actions--single">
              <button className="btn btn-dark rounded-pill px-4" onClick={() => setPopup(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchComments;
