package com.cdweb.be.service;

import com.cdweb.be.dto.request.SendMessageRequest;
import com.cdweb.be.dto.response.MessageDto;

import java.util.List;

public interface MessageService {
    
    MessageDto saveAndBroadcastMessage(SendMessageRequest request, Integer senderId);
    
    List<MessageDto> getMessages(Integer roomId, Integer userId, Long beforeId);
}
