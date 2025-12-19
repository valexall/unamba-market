package com.irissoft.app.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.irissoft.app.business.ChatBusiness;
import com.irissoft.app.controller.reqresp.RequestMessageSend;
import com.irissoft.app.controller.reqresp.ResponseConversationGetAll;
import com.irissoft.app.controller.reqresp.ResponseMessagesGet;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatBusiness chatBusiness;

    @PostMapping("/send")
    public ResponseEntity<ResponseGeneric> sendMessage(@RequestBody RequestMessageSend request, Principal principal) {
        ResponseGeneric response = new ResponseGeneric() {
        };
        try {
            chatBusiness.sendMessage(principal.getName(), request.getProductId(), request.getReceiverId(),
                    request.getContent());
            response.success();
            response.listMessage.add("Mensaje enviado");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<ResponseConversationGetAll> getMyConversations(Principal principal) {
        ResponseConversationGetAll response = new ResponseConversationGetAll();
        response.setListConversation(chatBusiness.getMyConversations(principal.getName()));
        response.success();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        return ResponseEntity.ok(chatBusiness.getTotalUnread(principal.getName()));
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<ResponseMessagesGet> getMessages(@PathVariable String conversationId, Principal principal) {
        ResponseMessagesGet response = new ResponseMessagesGet();
        response.setListMessage(chatBusiness.getMessages(conversationId, principal.getName()));
        response.success();
        return ResponseEntity.ok(response);
    }
}