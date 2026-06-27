package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.SendMessageRequest;
import com.cdweb.be.dto.response.MessageDto;
import com.cdweb.be.entity.Message;
import com.cdweb.be.entity.Room;
import com.cdweb.be.entity.User;
import com.cdweb.be.enums.MessageType;
import com.cdweb.be.enums.NotificationType;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MessageRepository;
import com.cdweb.be.repository.RoomMemberRepository;
import com.cdweb.be.repository.RoomRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.MessageService;
import com.cdweb.be.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MessageServiceImpl implements MessageService {

        private final MessageRepository messageRepository;
        private final RoomRepository roomRepository;
        private final RoomMemberRepository roomMemberRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        @Override
        @Transactional
        public MessageDto saveAndBroadcastMessage(SendMessageRequest request, Integer senderId) {
                Room room = roomRepository.findById(request.getRoomId())
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng chat"));

                // Validate sender is in the room
                roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(request.getRoomId(), senderId)
                                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN,
                                                "Bạn không có quyền gửi tin nhắn trong phòng này"));

                User sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

                Message message = Message.builder()
                                .roomId(room.getId())
                                .senderId(sender.getId())
                                .type(request.getType() != null ? request.getType() : MessageType.TEXT)
                                .content(request.getContent())
                                .metadata(request.getMetadata())
                                .build();

                Message savedMessage = messageRepository.save(message);

                // Cập nhật lastMessageAt để đẩy phòng chat lên đầu danh sách
                room.setLastMessageAt(LocalDateTime.now());
                roomRepository.save(room);

                // Gửi thông báo đến tất cả thành viên khác trong phòng
                try {
                        String previewContent;
                        if (savedMessage.getType() == MessageType.IMAGE) {
                                previewContent = "[Hình ảnh]";
                        } else if (savedMessage.getType() == MessageType.FEE_SPLIT) {
                                previewContent = "[Hóa đơn chia tiền]";
                        } else {
                                previewContent = savedMessage.getContent();
                        }

                        List<com.cdweb.be.entity.RoomMember> members = roomMemberRepository.findByRoomIdAndLeftAtIsNull(room.getId());
                        for (com.cdweb.be.entity.RoomMember member : members) {
                                if (!member.getUserId().equals(senderId)) {
                                        notificationService.sendNotification(
                                                        member.getUserId(),
                                                        senderId,
                                                        room.getName(),
                                                        previewContent,
                                                        NotificationType.NEW_MESSAGE,
                                                        room.getId()
                                        );
                                }
                        }
                } catch (Exception e) {
                        // Không ném exception để tránh rollback giao dịch gửi tin nhắn nếu gửi thông báo lỗi
                        log.error("Lỗi gửi thông báo tin nhắn mới: ", e);
                }

                // Trả về DTO chứa thông tin để broadcast cho client
                return MessageDto.builder()
                                .id(savedMessage.getId())
                                .roomId(savedMessage.getRoomId())
                                .senderId(sender.getId())
                                .senderName(sender.getFullName())
                                .senderAvatar(sender.getAvatarUrl())
                                .type(savedMessage.getType().name())
                                .content(savedMessage.getContent())
                                .metadata(savedMessage.getMetadata())
                                .createdAt(savedMessage.getCreatedAt())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<MessageDto> getMessages(Integer roomId, Integer userId, Long beforeId) {
                // Validate user is in the room
                roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(roomId, userId)
                                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN,
                                                "Bạn không có quyền xem tin nhắn trong phòng này"));

                Pageable pageable = PageRequest.of(0, 30);
                List<Message> messages;

                if (beforeId == null) {
                        messages = messageRepository.findByRoomIdAndDeletedAtIsNullOrderByIdDesc(roomId, pageable);
                } else {
                        messages = messageRepository.findByRoomIdAndIdLessThanAndDeletedAtIsNullOrderByIdDesc(roomId,
                                        beforeId, pageable);
                }

                List<MessageDto> dtos = messages.stream().map(msg -> {
                        User sender = userRepository.findById(msg.getSenderId()).orElse(null);
                        return MessageDto.builder()
                                        .id(msg.getId())
                                        .roomId(msg.getRoomId())
                                        .senderId(msg.getSenderId())
                                        .senderName(sender != null ? sender.getFullName() : "Unknown")
                                        .senderAvatar(sender != null ? sender.getAvatarUrl() : null)
                                        .type(msg.getType().name())
                                        .content(msg.getContent())
                                        .metadata(msg.getMetadata())
                                        .createdAt(msg.getCreatedAt())
                                        .build();
                }).collect(Collectors.toList());

                // Đảo ngược danh sách để trả về thứ tự thời gian tăng dần (cũ trước, mới sau)
                java.util.Collections.reverse(dtos);
                return dtos;
        }
}
