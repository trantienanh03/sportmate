package com.cdweb.be.dto.request;

import lombok.Data;

@Data
public class ExploreMatchRequest {
    private String keyword;
    private String sport;
    private String skillLevel;
    private String feeType;      // "free" | "paid" | null (all)
    private Double lat;
    private Double lng;
    private Double radiusKm;     // default handled in service
}
