package com.cdweb.be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RatingItemDto {
    @NotNull
    private Integer rateeId;

    @NotNull
    @Min(1) @Max(5)
    private Integer skillScore;

    @NotNull
    @Min(1) @Max(5)
    private Integer attitudeScore;

    private String comment;
}
