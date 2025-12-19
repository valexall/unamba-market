package com.irissoft.app.controller.reqresp;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestMessageSend {
    private String productId;
    private String receiverId;
    private String content;
}