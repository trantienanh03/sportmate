package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponseDto {
    private Integer id;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
}
