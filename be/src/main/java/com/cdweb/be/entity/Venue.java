package com.cdweb.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;
import com.cdweb.be.enums.VenuePlaceType;

@Entity
@Table(name = "venues")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 60)
    private String district;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(name = "google_place_id", length = 100)
    private String googlePlaceId;

    @Column(name = "google_maps_url", columnDefinition = "TEXT")
    private String googleMapsUrl;

    @Column(name = "verified")
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "usage_count")
    @Builder.Default
    private Integer usageCount = 0;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "place_type")
    private VenuePlaceType placeType;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "sport_tags")
    private List<String> sportTags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
