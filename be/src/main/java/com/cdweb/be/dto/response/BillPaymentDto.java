package com.cdweb.be.dto.response;

import com.cdweb.be.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillPaymentDto {
    private Integer id;
    private Integer billId;
    private Integer userId;
    private String userName;
    private String userAvatar;
    private Integer amount;
    private PaymentStatus status;
    private LocalDateTime scannedAt;
    private LocalDateTime paidAt;
    private Integer confirmedBy;
}
