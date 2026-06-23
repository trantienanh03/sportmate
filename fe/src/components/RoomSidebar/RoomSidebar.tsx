import React, { useState, useEffect } from "react";
import "./RoomSidebar.css";
import { splitBillService } from "../../services/splitBillService";
import type { SplitBillDto } from "../../services/splitBillService";
import type { MessageDto } from "../../services/chatService";

interface RoomSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
  messages: MessageDto[];
  onViewBill: (billId: number) => void;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
  isOpen,
  onClose,
  roomId,
  roomName,
  messages,
  onViewBill,
}) => {
  const [activeTab, setActiveTab] = useState<"media" | "bills">("media");
  const [bills, setBills] = useState<SplitBillDto[]>([]);
  const [isLoadingBills, setIsLoadingBills] = useState(false);
  const [billsError, setBillsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || activeTab !== "bills") return;

    // Sử dụng flag isMounted để tránh cập nhật state sau khi component đã unmount (ngăn rò rỉ bộ nhớ)
    let isMounted = true;
    const fetchBills = async () => {
      setIsLoadingBills(true);
      setBillsError(null);
      try {
        const data = await splitBillService.getRoomBills(roomId);
        if (isMounted) {
          setBills(data);
          setIsLoadingBills(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setBillsError(err.message || "Không thể tải danh sách hóa đơn");
          setIsLoadingBills(false);
        }
      }
    };

    fetchBills();
    return () => {
      isMounted = false;
    };
  }, [roomId, activeTab, isOpen]);

  if (!isOpen) return null;

  // Ảnh bill chuyển khoản cũng sẽ nằm ở đây nếu được gửi dưới dạng ảnh (IMAGE)
  const imageMessages = messages.filter((msg) => msg.type === "IMAGE");

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="room-sidebar-container animate-slide-left">
      <div className="sidebar-header">
        <h3 className="sidebar-title" title={roomName}>
          Tư liệu: {roomName}
        </h3>
        <button className="btn-close-sidebar" onClick={onClose} title="Đóng">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab-btn ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
        >
          <i className="far fa-images me-2"></i>Hình ảnh ({imageMessages.length})
        </button>
        <button
          className={`sidebar-tab-btn ${activeTab === "bills" ? "active" : ""}`}
          onClick={() => setActiveTab("bills")}
        >
          <i className="fas fa-file-invoice-dollar me-2"></i>Hóa đơn ({bills.length})
        </button>
      </div>

      <div className="sidebar-body">
        {activeTab === "media" ? (
          <div className="media-tab-content">
            {imageMessages.length === 0 ? (
              <div className="sidebar-empty-state">
                <i className="far fa-image fa-3x mb-3 text-muted"></i>
                <p>Chưa có hình ảnh nào được gửi trong phòng chat này.</p>
              </div>
            ) : (
              <div className="media-grid">
                {imageMessages.map((msg) => (
                  <div key={msg.id} className="media-grid-item-wrapper">
                    <img
                      src={msg.content}
                      alt="Room Media"
                      className="media-grid-item"
                      onClick={() => window.open(msg.content, "_blank")}
                      title="Click để xem ảnh gốc"
                    />
                    <span className="media-item-time">
                      {new Date(msg.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bills-tab-content">
            {isLoadingBills ? (
              <div className="sidebar-loading">
                <i className="fas fa-spinner fa-spin fa-2x text-primary"></i>
                <p className="mt-2">Đang tải danh sách hóa đơn...</p>
              </div>
            ) : billsError ? (
              <div className="sidebar-error">
                <i className="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                <p>{billsError}</p>
              </div>
            ) : bills.length === 0 ? (
              <div className="sidebar-empty-state">
                <i className="fas fa-file-invoice-dollar fa-3x mb-3 text-muted"></i>
                <p>Phòng chat chưa tạo hóa đơn chia tiền nào.</p>
              </div>
            ) : (
              <div className="sidebar-bills-list">
                {bills.map((bill) => (
                  <div key={bill.id} className={`sidebar-bill-card status-${bill.status.toLowerCase()}`}>
                    <div className="bill-card-info">
                      <div className="bill-card-badge-row">
                        <span className={`bill-status-badge ${bill.status.toLowerCase()}`}>
                          {bill.status === "ACTIVE"
                            ? "Đang thu"
                            : bill.status === "COMPLETED"
                            ? "Hoàn thành"
                            : "Đã đóng"}
                        </span>
                      </div>
                      <h4 className="bill-card-title">{bill.title}</h4>
                      <div className="bill-card-meta">
                        <span>Tổng: {formatVnd(bill.totalAmount)}</span>
                        <span>Mỗi người: {formatVnd(bill.perPerson)}</span>
                      </div>
                    </div>
                    <button className="btn-view-bill-detail" onClick={() => onViewBill(bill.id)}>
                      Chi tiết <i className="fas fa-chevron-right ms-1"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSidebar;
