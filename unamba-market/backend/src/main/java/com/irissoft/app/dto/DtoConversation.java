package com.irissoft.app.dto;

import java.time.LocalDateTime;
import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;

// DTO para Conversación
@Getter
@Setter
public class DtoConversation extends DtoGeneric {
    private String idConversation;
    private String idProduct;
    private String productName;
    private String productImageUrl;
    private Integer unreadCount;
    private String otherUserName;
    private String otherUserId;
    private String otherUserProfileImage;
    
    private LocalDateTime lastMessageAt;
    private String lastMessageContent; 
}