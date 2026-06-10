package com.cdweb.be.dto.response;

import com.cdweb.be.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Integer id;
    private String title;
    private String content;
    private NotificationType type;
    private Integer relatedEntityId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String senderName;
    private String senderAvatar;
}
