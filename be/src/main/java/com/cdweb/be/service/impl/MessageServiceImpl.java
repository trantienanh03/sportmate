package com.cdweb.be.service.impl;

import com.cdweb.be.dto.request.SendMessageRequest;
import com.cdweb.be.dto.response.MessageDto;
import com.cdweb.be.entity.Message;
import com.cdweb.be.entity.Room;
import com.cdweb.be.entity.User;
import com.cdweb.be.enums.MessageType;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.MessageRepository;
import com.cdweb.be.repository.RoomMemberRepository;
import com.cdweb.be.repository.RoomRepository;
import com.cdweb.be.repository.UserRepository;
import com.cdweb.be.service.MessageService;
import lombok.RequiredArgsConstructor;
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
public class MessageServiceImpl implements MessageService {

        private final MessageRepository messageRepository;
        private final RoomRepository roomRepository;
        private final RoomMemberRepository roomMemberRepository;
        private final UserRepository userRepository;

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

                return messages.stream().map(msg -> {
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
        }
}
