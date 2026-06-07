package com.cdweb.be.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Integer roomId;
    private Integer senderId;
    private String senderName;
    private String senderAvatar;
    private String type;
    private String content;
    private String metadata;
    private LocalDateTime createdAt;
}
