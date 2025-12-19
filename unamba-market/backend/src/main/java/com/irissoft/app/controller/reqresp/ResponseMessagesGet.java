package com.irissoft.app.controller.reqresp;

import java.util.List;
import com.irissoft.app.dto.DtoMessage;
import com.irissoft.app.generic.ResponseGeneric;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseMessagesGet extends ResponseGeneric {
    private List<DtoMessage> listMessage;
}