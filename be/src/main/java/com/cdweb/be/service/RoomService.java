package com.cdweb.be.service;

import com.cdweb.be.dto.response.RoomSummaryDto;

import java.util.List;

public interface RoomService {

    /**
     * Tạo room cho match — gọi nội bộ từ MatchService.
     * Tự động thêm host vào room_members với role HOST.
     */
    void createRoomForMatch(Integer matchId, Integer hostId, String matchTitle);

    /**
     * Danh sách room của user (đang là thành viên, chưa rời),
     * sort theo lastMessageAt DESC.
     */
    List<RoomSummaryDto> getUserRooms(Integer userId);

    /**
     * Chấp nhận lời mời: thêm user vào room_members với role MEMBER.
     * Ném exception nếu user đã trong room.
     */
    void joinRoom(Integer roomId, Integer userId);

    /**
     * Rời phòng: soft delete — set left_at = NOW().
     * Tin nhắn cũ vẫn giữ nguyên.
     */
    void leaveRoom(Integer roomId, Integer userId);
}
