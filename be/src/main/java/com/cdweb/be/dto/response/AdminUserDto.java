package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserDto {
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean isBanned;
    private LocalDateTime bannedUntil;
    private LocalDateTime createdAt;
}
