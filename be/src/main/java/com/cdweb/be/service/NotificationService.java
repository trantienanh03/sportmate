package com.cdweb.be.service;

import com.cdweb.be.dto.response.NotificationDto;
import com.cdweb.be.enums.NotificationType;
import org.springframework.data.domain.Page;

public interface NotificationService {

    void sendNotification(Integer recipientId, Integer senderId, String title, String content, NotificationType type, Integer relatedEntityId);

    Page<NotificationDto> getNotifications(Integer recipientId, int page, int size);

    long getUnreadCount(Integer recipientId);

    void markAsRead(Integer notificationId, Integer recipientId);

    void markAllAsRead(Integer recipientId);
}
