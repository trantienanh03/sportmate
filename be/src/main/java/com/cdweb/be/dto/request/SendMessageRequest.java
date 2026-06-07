package com.cdweb.be.dto.request;

import com.cdweb.be.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    @NotNull(message = "roomId cannot be null")
    private Integer roomId;
    
    private MessageType type;
    
    private String content;
    
    private String metadata;
}
