package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminBillDto {
    private Integer id;
    private Integer roomId;
    private Integer matchId;
    private String creatorName;
    private Integer creatorId;
    private String title;
    private Integer totalAmount;
    private Integer perPerson;
    private Integer participantCount;
    private String bankCode;
    private String accountNumber;
    private String accountName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private List<PaymentDetail> payments;

    @Data
    @Builder
    public static class PaymentDetail {
        private Integer id;
        private Integer userId;
        private String userName;
        private Integer amount;
        private String status;
        private LocalDateTime scannedAt;
        private LocalDateTime paidAt;
    }
}
