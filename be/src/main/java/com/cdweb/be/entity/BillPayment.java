package com.cdweb.be.entity;

import com.cdweb.be.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "bill_payments",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_bill_payments_bill_user",
        columnNames = {"bill_id", "user_id"}
    )
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "bill_id", nullable = false)
    private Integer billId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    // Luồng 2 bước: PENDING -> SCANNED (thành viên chuyển) -> PAID (chủ sân xác nhận)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "confirmed_by")
    private Integer confirmedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
