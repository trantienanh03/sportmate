package com.cdweb.be.controller;

import com.cdweb.be.dto.response.MessageDto;
import com.cdweb.be.exception.AppException;
import com.cdweb.be.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms/{roomId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    private Integer requireUserId(HttpServletRequest req) {
        Integer userId = com.cdweb.be.util.SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập");
        }
        return userId;
    }

    @GetMapping
    public ResponseEntity<List<MessageDto>> getMessages(
            @PathVariable Integer roomId,
            @RequestParam(required = false) Long before,
            HttpServletRequest req) {
        Integer userId = requireUserId(req);
        List<MessageDto> messages = messageService.getMessages(roomId, userId, before);
        return ResponseEntity.ok(messages);
    }
}
