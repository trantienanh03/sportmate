package com.cdweb.be.dto.response;

import com.cdweb.be.enums.BillStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SplitBillDto {
    private Integer id;
    private Integer roomId;
    private Integer matchId;
    private Integer createdBy;
    private String title;
    private Integer totalAmount;
    private Integer perPerson;
    private Integer participantCount;
    private String bankCode;
    private String accountNumber;
    private String accountName;
    private String note;
    private BillStatus status;
    private Integer paidCount;
    private Integer scannedCount;
    private Long messageId;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private List<BillPaymentDto> payments;
}
