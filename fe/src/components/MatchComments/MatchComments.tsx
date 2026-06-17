import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { matchService, type MatchComment } from '../../services/matchService';
import './MatchComments.css';

interface MatchCommentsProps {
  matchId: number;
}

const MatchComments: React.FC<MatchCommentsProps> = ({ matchId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [popup, setPopup] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [matchId]);

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
      const comment = await matchService.addComment(matchId, newComment.trim());
      setComments((prev) => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      setPopup({ type: 'error', message: 'Không thể đăng bình luận. Vui lòng thử lại.' });
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
      setComments((prev) => prev.filter((c) => c.id !== confirmDeleteId));
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
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleEditSubmit = async (commentId: number) => {
    if (!editingContent.trim()) return;
    try {
      const updated = await matchService.updateComment(commentId, matchId, editingContent.trim());
      setComments((prev) => prev.map((c) => c.id === commentId ? updated : c));
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

  return (
    <div className="match-comments-section">
      <h3 className="match-comments-title">Bình luận trận đấu</h3>
      
      {isLoading ? (
        <div className="comments-loading">Đang tải bình luận...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
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
                    {user && user.id === comment.userId && (
                      <div className="d-flex gap-3 mt-1">
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
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form className="comment-input-area" onSubmit={handleSubmit}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="comment-avatar" />
          ) : (
            <div className="comment-avatar-placeholder">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <textarea
            className="comment-input"
            placeholder="Viết bình luận..."
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
        <div className="comments-empty">Bạn cần đăng nhập để bình luận.</div>
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
