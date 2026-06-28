const API_URL = "/api";

export interface CreateSplitBillPayload {
  roomId: number;
  title: string;
  totalAmount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  note?: string;
}

export interface BillPaymentDto {
  id: number;
  billId: number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  amount: number;
  status: "PENDING" | "SCANNED" | "PAID";
  scannedAt: string | null;
  paidAt: string | null;
  confirmedBy: number | null;
}

export interface SplitBillDto {
  id: number;
  roomId: number;
  matchId: number | null;
  createdBy: number;
  title: string;
  totalAmount: number;
  perPerson: number;
  participantCount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  note: string | null;
  status: "ACTIVE" | "COMPLETED" | "CLOSED";
  paidCount: number;
  scannedCount: number;
  messageId: number | null;
  createdAt: string;
  closedAt: string | null;
  payments: BillPaymentDto[];
}

export const splitBillService = {
  createSplitBill: async (data: CreateSplitBillPayload): Promise<SplitBillDto> => {
    const response = await fetch(`${API_URL}/split-bills`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let message = "Tạo hóa đơn chia tiền thất bại";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // bỏ qua nếu lỗi parse json
      }
      throw new Error(message);
    }

    return response.json();
  },

  getBillDetail: async (billId: number): Promise<SplitBillDto> => {
    const response = await fetch(`${API_URL}/split-bills/${billId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Không thể tải chi tiết hóa đơn");
    }

    return response.json();
  },

  getRoomBills: async (roomId: number): Promise<SplitBillDto[]> => {
    const response = await fetch(`${API_URL}/rooms/${roomId}/split-bills`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách hóa đơn");
    }

    return response.json();
  },

  markScanned: async (billId: number): Promise<SplitBillDto> => {
    const response = await fetch(`${API_URL}/split-bills/${billId}/mark-scanned`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Đánh dấu đã chuyển khoản thất bại";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // bỏ qua
      }
      throw new Error(message);
    }

    return response.json();
  },

  confirmPayment: async (billId: number, userId: number): Promise<SplitBillDto> => {
    const response = await fetch(`${API_URL}/split-bills/${billId}/payments/${userId}/confirm`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Xác nhận thanh toán thất bại";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // bỏ qua
      }
      throw new Error(message);
    }

    return response.json();
  },

  closeBill: async (billId: number): Promise<SplitBillDto> => {
    const response = await fetch(`${API_URL}/split-bills/${billId}/close`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Đóng hóa đơn thất bại";
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // bỏ qua
      }
      throw new Error(message);
    }

    return response.json();
  },

  // Build VietQR URL công khai
  buildVietQrUrl: (
    bankCode: string,
    accountNumber: string,
    amount: number,
    note: string,
    accountName: string
  ): string => {
    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      note
    )}&accountName=${encodeURIComponent(accountName)}`;
  },
};
