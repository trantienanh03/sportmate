package com.cdweb.be.controller;

import com.cdweb.be.dto.response.RoomSummaryDto;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    private Integer requireUserId(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        return (Integer) session.getAttribute("userId");
    }

    @GetMapping
    public ResponseEntity<List<RoomSummaryDto>> getMyRooms(HttpServletRequest req) {
        Integer userId = requireUserId(req);
        return ResponseEntity.ok(roomService.getUserRooms(userId));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinRoom(@PathVariable Integer id, HttpServletRequest req) {
        Integer userId = requireUserId(req);
        roomService.joinRoom(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable Integer id, HttpServletRequest req) {
        Integer userId = requireUserId(req);
        roomService.leaveRoom(id, userId);
        return ResponseEntity.ok().build();
    }
}
