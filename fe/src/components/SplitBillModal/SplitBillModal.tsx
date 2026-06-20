import React, { useState } from "react";
import "./SplitBillModal.css";
import { splitBillService } from "../../services/splitBillService";

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  memberCount: number;
  onCreated: (billId: number) => void;
}

const SUPPORTED_BANKS = [
  { code: "MB", name: "MB Bank (Ngân hàng Quân Đội)" },
  { code: "VCB", name: "Vietcombank" },
  { code: "TCB", name: "Techcombank" },
  { code: "ACB", name: "ACB" },
  { code: "VPB", name: "VPBank" },
  { code: "CTG", name: "VietinBank" },
  { code: "BIDV", name: "BIDV" },
  { code: "TPB", name: "TPBank" },
  { code: "VIB", name: "VIB" },
  { code: "HDB", name: "HDBank" },
];

const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  roomId,
  memberCount,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [bankCode, setBankCode] = useState(SUPPORTED_BANKS[0].code);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const perPerson = totalAmount && memberCount > 0 ? Math.round(totalAmount / memberCount) : 0;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handleTotalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setTotalAmount("");
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setTotalAmount(num);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalAmount || !accountNumber.trim() || !accountName.trim()) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await splitBillService.createSplitBill({
        roomId,
        title: title.trim(),
        totalAmount: Number(totalAmount),
        bankCode,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim().toUpperCase(),
        note: note.trim() || `SportMate ${title.trim()}`,
      });
      onCreated(result.id);
      setTitle("");
      setTotalAmount("");
      setAccountNumber("");
      setAccountName("");
      setNote("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Tạo hóa đơn chia tiền thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-bill-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="split-bill-modal-content">
        <button className="split-bill-modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <h3 className="split-bill-modal-title">
          <i className="fas fa-file-invoice-dollar me-2 text-primary"></i>
          Chia tiền sân & chi phí
        </h3>

        {error && <div className="split-bill-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="split-bill-modal-form">
          <div className="form-group-row">
            <div className="form-group">
              <label>Tiêu đề hóa đơn <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: Tiền sân ngày 20/06"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Tổng số tiền (VND) <span className="required">*</span></label>
              <input
                type="number"
                min="1000"
                placeholder="Ví dụ: 150000"
                value={totalAmount}
                onChange={handleTotalAmountChange}
                required
              />
            </div>
          </div>

          <div className="split-bill-preview-box">
            <div className="preview-item">
              <span>Số người trong phòng:</span>
              <strong>{memberCount} người</strong>
            </div>
            <div className="preview-item highlighted">
              <span>Mỗi người cần trả:</span>
              <strong>{formatVnd(perPerson)}</strong>
            </div>
          </div>

          <hr className="divider" />

          <h4 className="section-subtitle">Thông tin nhận tiền (Tạo VietQR)</h4>

          <div className="form-group">
            <label>Ngân hàng nhận <span className="required">*</span></label>
            <select value={bankCode} onChange={(e) => setBankCode(e.target.value)}>
              {SUPPORTED_BANKS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Số tài khoản <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Nhập số tài khoản"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Tên chủ tài khoản <span className="required">*</span></label>
              <input
                type="text"
                placeholder="Ví dụ: NGUYEN VAN A"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Nội dung chuyển khoản (Tùy chọn)</label>
            <input
              type="text"
              placeholder={`Mặc định: SportMate [Tiêu đề]`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="split-bill-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? "Đang tạo..." : "Tạo hóa đơn & chia tiền"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SplitBillModal;
