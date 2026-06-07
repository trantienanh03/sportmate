package com.cdweb.be.service.impl;

import com.cdweb.be.dto.response.RoomSummaryDto;
import com.cdweb.be.entity.Room;
import com.cdweb.be.entity.RoomMember;
import com.cdweb.be.enums.MemberRole;
import com.cdweb.be.enums.RoomType;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.repository.RoomMemberRepository;
import com.cdweb.be.repository.RoomRepository;
import com.cdweb.be.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;


    @Override
    @Transactional
    public void createRoomForMatch(Integer matchId, Integer hostId, String matchTitle) {
        Room room = Room.builder()
                .matchId(matchId)
                .name(matchTitle)
                .type(RoomType.GROUP)
                .createdBy(hostId)
                .build();

        Room saved = roomRepository.save(room);


        RoomMember hostMember = RoomMember.builder()
                .roomId(saved.getId())
                .userId(hostId)
                .role(MemberRole.HOST)
                .build();
        roomMemberRepository.save(hostMember);
    }


    @Override
    @Transactional(readOnly = true)
    public List<RoomSummaryDto> getUserRooms(Integer userId) {
        List<Room> rooms = roomRepository.findRoomsByUserId(userId);

        return rooms.stream().map(room -> {
            int memberCount = roomMemberRepository.findByRoomIdAndLeftAtIsNull(room.getId()).size();
            return RoomSummaryDto.builder()
                    .id(room.getId())
                    .name(room.getName())
                    .type(room.getType().name())
                    .matchId(room.getMatchId())
                    .participantCount(memberCount)
                    .lastMessageAt(room.getLastMessageAt())
                    .createdAt(room.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }


    @Override
    @Transactional
    public void joinRoom(Integer roomId, Integer userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng chat"));


        roomMemberRepository.findByRoomIdAndUserIdAndLeftAtIsNull(roomId, userId)
                .ifPresent(m -> { throw new AppException(HttpStatus.CONFLICT, "Bạn đã trong phòng chat này rồi"); });

        RoomMember member = RoomMember.builder()
                .roomId(room.getId())
                .userId(userId)
                .role(MemberRole.MEMBER)
                .build();
        roomMemberRepository.save(member);
    }


    @Override
    @Transactional
    public void leaveRoom(Integer roomId, Integer userId) {
        RoomMember member = roomMemberRepository
                .findByRoomIdAndUserIdAndLeftAtIsNull(roomId, userId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Bạn không ở trong phòng chat này"));

        if (member.getRole() == MemberRole.HOST) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Host không thể rời phòng chat");
        }

        member.setLeftAt(LocalDateTime.now());
        roomMemberRepository.save(member);
    }
}
