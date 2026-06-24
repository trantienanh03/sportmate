package com.cdweb.be.entity;

import com.cdweb.be.enums.MatchStatus;
import com.cdweb.be.enums.SkillLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    @Column(name = "sport", nullable = false, length = 100)
    private String sport;

    @Column(name = "custom_sport", length = 100)
    private String customSport;

    @Column(name = "location_text", length = 255)
    private String locationText;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "match_status default 'open'")
    @Builder.Default
    private MatchStatus status = MatchStatus.open;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "skill_level", nullable = false, columnDefinition = "skill_level default 'beginner'")
    @Builder.Default
    private SkillLevel skillLevel = SkillLevel.beginner;

    @Column(name = "max_players", nullable = false)
    private Short maxPlayers;

    @Column(name = "current_players", nullable = false)
    @Builder.Default
    private Short currentPlayers = 1;

    @Column(name = "fee_per_person", nullable = false)
    @Builder.Default
    private Integer feePerPerson = 0;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "is_approval_required", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isApprovalRequired")
    private Boolean isApprovalRequired = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
