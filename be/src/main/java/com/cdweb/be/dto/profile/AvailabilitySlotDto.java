package com.cdweb.be.dto.profile;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilitySlotDto {
    private String label;
    private String morning;
    private String afternoon;
    private String evening;
}
