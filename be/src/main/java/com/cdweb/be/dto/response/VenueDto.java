package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VenueDto {
    private Integer id;
    private String name;
    private String address;
    private String district;
    private Double lat;
    private Double lng;
    private String googleMapsUrl;
}
