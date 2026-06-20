import React, { useState, useEffect } from "react";
import "./SplitBillCard.css";
import { splitBillService, SplitBillDto } from "../../services/splitBillService";

interface SplitBillCardProps {
  billId: number;
  currentUserId: number;
  isHost: boolean;
  onViewDetail: (billId: number, onUpdate: (bill: SplitBillDto) => void) => void;
}

const SplitBillCard: React.FC<SplitBillCardProps> = ({
  billId,
  currentUserId,
  isHost,
  onViewDetail,
}) => {
  const [bill, setBill] = useState<SplitBillDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBill = async () => {
      try {
        const data = await splitBillService.getBillDetail(billId);
        if (isMounted) {
          setBill(data);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Lỗi tải hóa đơn");
          setIsLoading(false);
        }
      }
    };

    fetchBill();
    return () => {
      isMounted = false;
    };
  }, [billId]);

  const handleUpdate = (updatedBill: SplitBillDto) => {
    setBill(updatedBill);
  };

  if (isLoading) {
    return (
      <div className="split-bill-card loading">
        <i className="fas fa-spinner fa-spin me-2"></i> Đang tải hóa đơn chia tiền...
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="split-bill-card error">
        <i className="fas fa-exclamation-circle me-2"></i> Không thể tải hóa đơn chia tiền.
      </div>
    );
  }

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const progress = bill.participantCount > 0 ? (bill.paidCount / bill.participantCount) * 100 : 0;

  // Đếm số người ở trạng thái SCANNED (chờ duyệt) dành riêng cho host
  const pendingApprovals = isHost ? bill.scannedCount : 0;

  // Lấy trạng thái thanh toán cá nhân của user hiện tại
  const myPayment = bill.payments.find((p) => p.userId === currentUserId);
  const myPaymentStatus = myPayment ? myPayment.status : "PENDING";

  return (
    <div className={`split-bill-card status-${bill.status.toLowerCase()}`}>
      <div className="bill-card-header">
        <div className="bill-icon-wrapper">
          <i className="fas fa-file-invoice-dollar"></i>
        </div>
        <div className="bill-header-info">
          <div className="bill-badge-row">
            <span className={`bill-status-badge ${bill.status.toLowerCase()}`}>
              {bill.status === "ACTIVE"
                ? "Đang thu"
                : bill.status === "COMPLETED"
                ? "Hoàn thành"
                : "Đã đóng"}
            </span>

            {bill.status === "ACTIVE" && myPaymentStatus === "PAID" && (
              <span className="personal-status-badge paid">Bạn đã trả</span>
            )}
            {bill.status === "ACTIVE" && myPaymentStatus === "SCANNED" && (
              <span className="personal-status-badge scanned">Chờ duyệt</span>
            )}
            {bill.status === "ACTIVE" && myPaymentStatus === "PENDING" && bill.createdBy !== currentUserId && (
              <span className="personal-status-badge pending">Chưa trả</span>
            )}
          </div>
          <h4 className="bill-card-title">{bill.title}</h4>
        </div>
      </div>

      <div className="bill-card-body">
        <div className="bill-amount-info">
          <div className="amount-item">
            <span className="label">Mỗi người</span>
            <strong className="value highlighted">{formatVnd(bill.perPerson)}</strong>
          </div>
          <div className="amount-item">
            <span className="label">Tổng cộng</span>
            <span className="value">{formatVnd(bill.totalAmount)}</span>
          </div>
        </div>

        <div className="bill-progress-section">
          <div className="progress-labels">
            <span>Tiến độ thanh toán</span>
            <strong>
              {bill.paidCount}/{bill.participantCount} thành viên
            </strong>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {pendingApprovals > 0 && (
          <div className="bill-notification-alert">
            <i className="fas fa-bell me-2"></i>
            Có <strong>{pendingApprovals}</strong> người chờ xác nhận thanh toán
          </div>
        )}
      </div>

      <div className="bill-card-footer">
        <button className="btn-view-detail" onClick={() => onViewDetail(bill.id, handleUpdate)}>
          Xem QR &amp; Chi tiết <i className="fas fa-chevron-right ms-1"></i>
        </button>
      </div>
    </div>
  );
};

export default SplitBillCard;
