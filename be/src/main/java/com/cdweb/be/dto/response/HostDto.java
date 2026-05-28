package com.cdweb.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostDto {
    private Integer id;
    private String fullName;
    private String avatarUrl;
}
