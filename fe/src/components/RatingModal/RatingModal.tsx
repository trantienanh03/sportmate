import React, { useState } from 'react';
import { type RatingItemRequest, ratingService } from '../../services/ratingService';
import './RatingModal.css';

interface Ratee {
  id: number;
  name: string;
  avatar: string;
  isHost: boolean;
}

interface RatingModalProps {
  matchId: number;
  ratees: Ratee[];
  onClose: () => void;
  onSuccess: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ matchId, ratees, onClose, onSuccess }) => {
  const [ratings, setRatings] = useState<Record<number, RatingItemRequest>>(
    ratees.reduce((acc, ratee) => {
      acc[ratee.id] = { rateeId: ratee.id, skillScore: 0, attitudeScore: 0, comment: '' };
      return acc;
    }, {} as Record<number, RatingItemRequest>)
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreChange = (rateeId: number, field: 'skillScore' | 'attitudeScore', score: number) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: { ...prev[rateeId], [field]: score }
    }));
  };

  const handleCommentChange = (rateeId: number, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [rateeId]: { ...prev[rateeId], comment }
    }));
  };

  const isFormValid = () => {
    return Object.values(ratings).every(r => r.skillScore > 0 && r.attitudeScore > 0);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setError("Vui lòng chấm sao cho tất cả mọi người.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      await ratingService.submitBatchRatings({
        matchId,
        ratings: Object.values(ratings)
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rateeId: number, field: 'skillScore' | 'attitudeScore', currentScore: number) => {
    return (
      <div className="d-flex align-items-center mb-2">
        <span className="me-3 fw-medium text-muted" style={{ width: '100px' }}>
          {field === 'skillScore' ? 'Chuyên môn:' : 'Thái độ:'}
        </span>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= currentScore ? 'active' : ''}`}
              onClick={() => handleScoreChange(rateeId, field, star)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header bg-primary text-white">
          <h4 className="mb-0 fw-bold">Đánh giá sau trận đấu</h4>
          <button className="btn-close btn-close-white" onClick={onClose}></button>
        </div>
        <div className="rating-modal-body">
          <p className="text-muted mb-4">
            Trận đấu đã kết thúc! Hãy dành chút thời gian đánh giá những người chơi cùng bạn để giúp cộng đồng SportMate ngày càng chất lượng hơn.
          </p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="ratees-list">
            {ratees.map((ratee) => (
              <div key={ratee.id} className="ratee-card mb-4 p-3 border rounded-3 bg-light">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={ratee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ratee.name)}&background=e2e8f0&color=475569`}
                    alt={ratee.name}
                    className="rounded-circle me-3"
                    style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="mb-0 fw-bold">
                      {ratee.name}
                      {ratee.isHost && <span className="badge bg-warning text-dark ms-2">Host</span>}
                    </h6>
                  </div>
                </div>

                <div className="rating-inputs ps-2">
                  {renderStars(ratee.id, 'skillScore', ratings[ratee.id].skillScore)}
                  {renderStars(ratee.id, 'attitudeScore', ratings[ratee.id].attitudeScore)}
                  
                  <textarea
                    className="form-control mt-3"
                    rows={2}
                    placeholder={`Nhận xét thêm về ${ratee.name} (Tùy chọn)`}
                    value={ratings[ratee.id].comment || ''}
                    onChange={(e) => handleCommentChange(ratee.id, e.target.value)}
                  ></textarea>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button type="button" className="btn btn-outline-secondary px-4 rounded-pill" onClick={onClose} disabled={isSubmitting}>
              Bỏ qua
            </button>
            <button type="button" className="btn btn-primary px-4 rounded-pill" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
