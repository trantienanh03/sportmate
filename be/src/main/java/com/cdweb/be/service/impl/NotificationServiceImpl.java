package com.cdweb.be.service.impl;

import com.cdweb.be.dto.response.NotificationDto;
import com.cdweb.be.entity.Notification;
import com.cdweb.be.entity.User;
import com.cdweb.be.enums.NotificationType;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.NotificationRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional
    public void sendNotification(Integer recipientId, Integer senderId, String title, String content, NotificationType type, Integer relatedEntityId) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Recipient not found"));

        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId).orElse(null);
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .title(title)
                .content(content)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        NotificationDto dto = buildDto(saved);

        // Tình huống Race Condition có thể xảy ra ở đây nếu gọi convertAndSend trực tiếp:
        // 1. notificationRepository.save(notification) được gọi bên trong @Transactional.
        // 2. Nếu gọi convertAndSend ngay lập tức, WebSocket bắn thông báo đến Frontend.
        // 3. Frontend nhận tín hiệu và gọi API để tải notification mới về.
        // 4. Nhưng nếu lúc này Transaction chưa commit xong (hoặc bị rollback),
        //    DB chưa có dữ liệu => Frontend lấy về rỗng hoặc không thấy thông báo vừa nhận.
        // Giải pháp: Chỉ gửi WebSocket SAU KHI Transaction đã commit thành công vào DB.
        final NotificationDto finalDto = dto;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    messagingTemplate.convertAndSend("/topic/notifications/" + recipientId, finalDto);
                    log.info("Sent real-time notification to user id: {}", recipientId);
                } catch (Exception e) {
                    log.error("Failed to send real-time notification to user id: {} via WebSocket", recipientId, e);
                }
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getNotifications(Integer recipientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(recipientId, pageable);
        return notifications.map(this::buildDto);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Integer recipientId) {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(recipientId);
    }

    @Override
    @Transactional
    public void markAsRead(Integer notificationId, Integer recipientId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getRecipient().getId().equals(recipientId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You do not have permission to modify this notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(Integer recipientId) {
        notificationRepository.markAllAsRead(recipientId);
    }

    private NotificationDto buildDto(Notification notification) {
        String senderName = "Hệ thống";
        String senderAvatar = null;

        if (notification.getSender() != null) {
            senderName = notification.getSender().getFullName();
            senderAvatar = notification.getSender().getAvatarUrl();
        }

        return NotificationDto.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .content(notification.getContent())
                .type(notification.getType())
                .relatedEntityId(notification.getRelatedEntityId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .senderName(senderName)
                .senderAvatar(senderAvatar)
                .build();
    }
}
