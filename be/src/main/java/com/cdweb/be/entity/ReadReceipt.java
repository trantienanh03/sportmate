package com.cdweb.be.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "read_receipts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ReadReceipt.ReadReceiptId.class)
public class ReadReceipt {

    @Id
    @Column(name = "room_id", nullable = false)
    private Integer roomId;

    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;

    @Column(name = "read_at", nullable = false)
    @Builder.Default
    private LocalDateTime readAt = LocalDateTime.now();

    // Composite primary key class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReadReceiptId implements Serializable {
        private Integer roomId;
        private Integer userId;
    }
}
