package com.irissoft.app.dto;

import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;


// DTO para Mensaje
@Getter
@Setter
public class DtoMessage extends DtoGeneric {
    private String idMessage;
    private String idConversation;
    private String idSender;
    private String content;
    private boolean isRead;
}