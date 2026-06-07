package com.cdweb.be.entity;

import com.cdweb.be.enums.MemberRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "room_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(RoomMember.RoomMemberId.class)
public class RoomMember {

    @Id
    @Column(name = "room_id", nullable = false)
    private Integer roomId;

    @Id
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 10)
    @Builder.Default
    private MemberRole role = MemberRole.MEMBER;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    // Composite primary key class
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomMemberId implements Serializable {
        private Integer roomId;
        private Integer userId;
    }
}
