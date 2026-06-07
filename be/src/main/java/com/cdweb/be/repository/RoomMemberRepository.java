package com.cdweb.be.repository;

import com.cdweb.be.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, RoomMember.RoomMemberId> {

    /** Kiểm tra user có đang trong room không (chưa rời) */
    Optional<RoomMember> findByRoomIdAndUserIdAndLeftAtIsNull(Integer roomId, Integer userId);

    /** Danh sách thành viên hiện tại của room */
    List<RoomMember> findByRoomIdAndLeftAtIsNull(Integer roomId);

    /** Kiểm tra user đã từng ở trong room (kể cả đã rời) */
    boolean existsByRoomIdAndUserId(Integer roomId, Integer userId);
}
