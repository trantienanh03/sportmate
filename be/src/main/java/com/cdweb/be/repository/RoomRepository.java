package com.cdweb.be.repository;

import com.cdweb.be.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    /**
     * Lấy tất cả room mà user đang là thành viên (left_at IS NULL),
     * sort theo tin nhắn mới nhất.
     */
    @Query("""
            SELECT r FROM Room r
            WHERE r.id IN (
                SELECT rm.roomId FROM RoomMember rm
                WHERE rm.userId = :userId AND rm.leftAt IS NULL
            )
            ORDER BY r.lastMessageAt DESC NULLS LAST, r.createdAt DESC
            """)
    List<Room> findRoomsByUserId(@Param("userId") Integer userId);

    java.util.Optional<Room> findByMatchId(Integer matchId);
}
