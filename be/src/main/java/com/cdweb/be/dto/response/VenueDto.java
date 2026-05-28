package com.cdweb.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueDto {
    private Integer id;
    private String name;
    private String address;
    private String district;
    private Double lat;
    private Double lng;
    private List<String> sportTags;
    private Boolean verified;
    private String googleMapsUrl;
}
