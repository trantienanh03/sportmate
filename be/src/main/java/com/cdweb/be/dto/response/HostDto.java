package com.cdweb.be.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HostDto {
    private Integer id;
    private String fullName;
    private String avatarUrl;
}
