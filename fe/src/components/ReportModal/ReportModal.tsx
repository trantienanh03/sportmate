import React, { useState } from 'react';
import { reportService } from '../../services/reportService';
import './ReportModal.css';

interface ReportModalProps {
  reportedMatchId?: number;
  reportedUserId?: number;
  onClose: () => void;
  onSuccess: (reportId: number) => void;
}

const REPORT_REASONS = [
  "Kèo ảo, không có thật",
  "Lừa đảo, chiếm đoạt tài sản",
  "Nội dung phản cảm, quấy rối",
  "Spam, quảng cáo",
  "Khác"
];

const ReportModal: React.FC<ReportModalProps> = ({ reportedMatchId, reportedUserId, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newReport = await reportService.createReport({
        reportedMatchId,
        reportedUserId,
        reason: selectedReason,
        details: selectedReason === 'Khác' ? details : details.trim() ? details : undefined,
      });
      onSuccess(newReport.id);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h4 className="mb-0">Báo cáo vi phạm</h4>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="report-modal-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold">Lý do báo cáo:</label>
              {REPORT_REASONS.map((reason) => (
                <div className="form-check" key={reason}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="reportReason"
                    id={`reason-${reason}`}
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={`reason-${reason}`}>
                    {reason}
                  </label>
                </div>
              ))}
            </div>

            {(selectedReason === 'Khác' || selectedReason) && (
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Chi tiết thêm {selectedReason === 'Khác' && <span className="text-danger">*</span>}:
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Cung cấp thêm thông tin về vi phạm này..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required={selectedReason === 'Khác'}
                ></textarea>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </button>
              <button type="submit" className="btn btn-danger" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
