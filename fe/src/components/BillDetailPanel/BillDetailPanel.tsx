import React, { useState, useEffect } from "react";
import "./BillDetailPanel.css";
import { splitBillService } from "../../services/splitBillService";
import type { SplitBillDto } from "../../services/splitBillService";

interface BillDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  billId: number;
  currentUserId: number;
  isHost: boolean;
  onBillUpdated?: (bill: SplitBillDto) => void;
}

const BillDetailPanel: React.FC<BillDetailPanelProps> = ({
  isOpen,
  onClose,
  billId,
  currentUserId,
  isHost,
  onBillUpdated,
}) => {
  const [bill, setBill] = useState<SplitBillDto | null>(null);
  const [activeTab, setActiveTab] = useState<"qr" | "members">("qr");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await splitBillService.getBillDetail(billId);
        if (isMounted) {
          setBill(data);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Không thể tải thông tin chi tiết");
          setIsLoading(false);
        }
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [billId, isOpen]);

  if (!isOpen) return null;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMarkScanned = async () => {
    if (!bill) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await splitBillService.markScanned(bill.id);
      setBill(updated);
      onBillUpdated?.(updated);
    } catch (err: any) {
      setError(err.message || "Xử lý thất bại. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (targetUserId: number) => {
    if (!bill) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await splitBillService.confirmPayment(bill.id, targetUserId);
      setBill(updated);
      onBillUpdated?.(updated);
    } catch (err: any) {
      setError(err.message || "Xác nhận thất bại. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseBill = async () => {
    if (!bill || !window.confirm("Bạn có chắc chắn muốn đóng hóa đơn này? Thành viên sẽ không thể thanh toán tiếp.")) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await splitBillService.closeBill(bill.id);
      setBill(updated);
      onBillUpdated?.(updated);
    } catch (err: any) {
      setError(err.message || "Đóng hóa đơn thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bill-detail-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bill-detail-panel animate-slide-left">
        <div className="panel-header">
          <button className="btn-close-panel" onClick={onClose}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h3 className="panel-title">Chi tiết hóa đơn chia tiền</h3>
        </div>

        {isLoading ? (
          <div className="panel-loading">
            <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
            <p className="mt-2">Đang tải thông tin hóa đơn...</p>
          </div>
        ) : error || !bill ? (
          <div className="panel-error-box">
            <i className="fas fa-exclamation-triangle fa-2x text-danger mb-3"></i>
            <p>{error || "Không tìm thấy dữ liệu hóa đơn."}</p>
            <button className="btn-retry" onClick={onClose}>Quay lại</button>
          </div>
        ) : (
          <div className="panel-body">
            <div className="bill-summary-card">
              <h4 className="bill-title">{bill.title}</h4>
              <div className="bill-stat-row">
                <div className="stat-item">
                  <span className="label">Tổng chi phí</span>
                  <strong className="value">{formatVnd(bill.totalAmount)}</strong>
                </div>
                <div className="stat-item highlighted">
                  <span className="label">Mỗi người</span>
                  <strong className="value text-primary">{formatVnd(bill.perPerson)}</strong>
                </div>
              </div>
            </div>

            <div className="panel-tabs">
              <button
                className={`tab-btn ${activeTab === "qr" ? "active" : ""}`}
                onClick={() => setActiveTab("qr")}
              >
                <i className="fas fa-qrcode me-2"></i>Quét mã QR
              </button>
              <button
                className={`tab-btn ${activeTab === "members" ? "active" : ""}`}
                onClick={() => setActiveTab("members")}
              >
                <i className="fas fa-users me-2"></i>Thành viên ({bill.paidCount}/{bill.participantCount})
              </button>
            </div>

            <div className="tab-content-container">
              {activeTab === "qr" ? (
                <div className="qr-tab-content">
                  {bill.status === "ACTIVE" ? (
                    <>
                      <div className="vietqr-container">
                        <img
                          src={splitBillService.buildVietQrUrl(
                            bill.bankCode,
                            bill.accountNumber,
                            bill.perPerson,
                            bill.note || `SportMate ${bill.title}`,
                            bill.accountName
                          )}
                          alt="VietQR code"
                          className="vietqr-img"
                        />
                        <div className="vietqr-scan-guide">
                          <i className="fas fa-mobile-alt me-1"></i> Quét bằng ứng dụng Ngân hàng của bạn
                        </div>
                      </div>

                      <div className="payment-details-list">
                        <div className="detail-row">
                          <span className="label">Ngân hàng</span>
                          <span className="value font-bold">{bill.bankCode}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Số tài khoản</span>
                          <div className="value-with-action">
                            <span className="value font-mono font-bold">{bill.accountNumber}</span>
                            <button
                              className="btn-copy"
                              onClick={() => handleCopy(bill.accountNumber, "accountNumber")}
                            >
                              {copiedField === "accountNumber" ? "Đã copy" : <i className="far fa-copy"></i>}
                            </button>
                          </div>
                        </div>
                        <div className="detail-row">
                          <span className="label">Chủ tài khoản</span>
                          <span className="value font-bold">{bill.accountName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Số tiền</span>
                          <div className="value-with-action">
                            <span className="value font-bold text-primary">{formatVnd(bill.perPerson)}</span>
                            <button
                              className="btn-copy"
                              onClick={() => handleCopy(bill.perPerson.toString(), "amount")}
                            >
                              {copiedField === "amount" ? "Đã copy" : <i className="far fa-copy"></i>}
                            </button>
                          </div>
                        </div>
                        <div className="detail-row">
                          <span className="label">Nội dung CK</span>
                          <div className="value-with-action">
                            <span className="value font-bold">{bill.note || `SportMate ${bill.title}`}</span>
                            <button
                              className="btn-copy"
                              onClick={() => handleCopy(bill.note || `SportMate ${bill.title}`, "note")}
                            >
                              {copiedField === "note" ? "Đã copy" : <i className="far fa-copy"></i>}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="personal-action-section">
                        {(() => {
                          const myPay = bill.payments.find((p) => p.userId === currentUserId);
                          if (!myPay) return <div className="text-muted text-center text-sm">Bạn không có lượt thanh toán trong hóa đơn này.</div>;

                          if (myPay.status === "PAID") {
                            return (
                              <div className="status-notification success">
                                <i className="fas fa-check-circle me-2"></i> Khoản thanh toán của bạn đã được xác nhận!
                              </div>
                            );
                          }

                          if (myPay.status === "SCANNED") {
                            return (
                              <div className="status-notification warning animate-pulse">
                                <i className="fas fa-clock me-2"></i> Bạn đã báo chuyển khoản. Đang chờ Host xác nhận duyệt.
                              </div>
                            );
                          }

                          return (
                            <button
                              className="btn-action-primary"
                              onClick={handleMarkScanned}
                              disabled={actionLoading}
                            >
                              {actionLoading ? "Đang xử lý..." : "Tôi đã chuyển khoản cho Host"}
                            </button>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    <div className="bill-inactive-box">
                      <i className={`fas ${bill.status === "COMPLETED" ? "fa-check-circle text-success" : "fa-lock text-slate"} fa-3x mb-3`}></i>
                      <h4>Hóa đơn {bill.status === "COMPLETED" ? "đã hoàn thành" : "đã đóng"}</h4>
                      <p className="text-muted text-sm mt-1">
                        Hóa đơn này không còn hoạt động để chuyển khoản hoặc duyệt trạng thái thanh toán.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="members-tab-content">
                  <div className="members-progress-info">
                    <span>Đã thanh toán:</span>
                    <strong>{bill.paidCount} / {bill.participantCount} thành viên</strong>
                  </div>

                  <ul className="member-payments-list">
                    {bill.payments.map((p) => {
                      const isTargetUser = p.userId === currentUserId;
                      return (
                        <li key={p.id} className={`member-item ${isTargetUser ? "current-user" : ""}`}>
                          <div className="member-avatar-wrapper">
                            {p.userAvatar ? (
                              <img src={p.userAvatar} alt={p.userName} className="member-avatar" />
                            ) : (
                              <div className="member-avatar-fallback">
                                {p.userName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="member-info">
                            <span className="member-name">
                              {p.userName} {isTargetUser && <span className="user-self-label">(Bạn)</span>}
                            </span>
                            <span className="member-amount">{formatVnd(p.amount)}</span>
                          </div>

                          <div className="member-action-status">
                            {p.status === "PAID" && (
                              <span className="status-indicator success">
                                <i className="fas fa-check-circle me-1"></i> Đã trả
                              </span>
                            )}
                            {p.status === "SCANNED" && (
                              <>
                                {isHost && bill.status === "ACTIVE" ? (
                                  <button
                                    className="btn-confirm-member"
                                    onClick={() => handleConfirmPayment(p.userId)}
                                    disabled={actionLoading}
                                  >
                                    Xác nhận
                                  </button>
                                ) : (
                                  <span className="status-indicator warning">
                                    <i className="fas fa-clock me-1"></i> Chờ duyệt
                                  </span>
                                )}
                              </>
                            )}
                            {p.status === "PENDING" && (
                              <span className="status-indicator pending">
                                Chưa chuyển
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {isHost && bill.status === "ACTIVE" && (
                    <div className="host-admin-actions">
                      <button
                        className="btn-close-bill-admin"
                        onClick={handleCloseBill}
                        disabled={actionLoading}
                      >
                        <i className="fas fa-power-off me-2"></i> Đóng hóa đơn thủ công
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillDetailPanel;
