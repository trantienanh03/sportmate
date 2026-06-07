package com.cdweb.be.controller;

import com.cdweb.be.dto.request.SendMessageRequest;
import com.cdweb.be.dto.response.MessageDto;
import com.cdweb.be.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{roomId}")
    public void handleMessage(@DestinationVariable Integer roomId, 
                              @Payload SendMessageRequest request,
                              SimpMessageHeaderAccessor headerAccessor) {
        
        try {
            // Retrieve session attributes from websocket
            Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
            Integer senderId = null;
            
            if (sessionAttributes != null && sessionAttributes.containsKey("userId")) {
                senderId = (Integer) sessionAttributes.get("userId");
            }
            
            if (senderId == null) {
                log.error("User not authenticated in websocket session!");
                return;
            }

            request.setRoomId(roomId);
            MessageDto savedMessage = messageService.saveAndBroadcastMessage(request, senderId);
            
            // Broadcast to the room
            messagingTemplate.convertAndSend("/topic/room/" + roomId, savedMessage);
            
        } catch (Exception e) {
            log.error("Error handling message: ", e);
        }
    }
}
