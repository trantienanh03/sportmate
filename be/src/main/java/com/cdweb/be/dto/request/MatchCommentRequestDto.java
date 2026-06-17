package com.cdweb.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MatchCommentRequestDto {
    @NotNull(message = "Match ID is required")
    private Integer matchId;

    @NotBlank(message = "Content is required")
    private String content;
}
