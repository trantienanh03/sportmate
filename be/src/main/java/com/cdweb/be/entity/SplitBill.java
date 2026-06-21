package com.cdweb.be.entity;

import com.cdweb.be.enums.BillStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "split_bills")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SplitBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "room_id", nullable = false)
    private Integer roomId;

    @Column(name = "match_id")
    private Integer matchId;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "per_person", nullable = false)
    private Integer perPerson;

    @Column(name = "participant_count", nullable = false)
    private Integer participantCount;

    // Thông tin ngân hàng để build VietQR URL ở FE
    @Column(name = "bank_code", nullable = false, length = 20)
    private String bankCode;

    @Column(name = "account_number", nullable = false, length = 30)
    private String accountNumber;

    @Column(name = "account_name", nullable = false, length = 100)
    private String accountName;

    @Column(name = "note", length = 200)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BillStatus status = BillStatus.ACTIVE;

    // ID của message FEE_SPLIT được tạo khi tạo bill
    @Column(name = "message_id")
    private Long messageId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}
