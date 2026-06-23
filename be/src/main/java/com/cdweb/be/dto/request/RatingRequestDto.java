package com.cdweb.be.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class RatingRequestDto {
    @NotNull
    private Integer matchId;

    @NotEmpty
    @Valid
    private List<RatingItemDto> ratings;
}
