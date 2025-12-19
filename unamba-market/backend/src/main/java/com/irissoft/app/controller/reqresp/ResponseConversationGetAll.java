package com.irissoft.app.controller.reqresp;

import java.util.List;
import com.irissoft.app.dto.DtoConversation;
import com.irissoft.app.generic.ResponseGeneric;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseConversationGetAll extends ResponseGeneric {
    private List<DtoConversation> listConversation;
}