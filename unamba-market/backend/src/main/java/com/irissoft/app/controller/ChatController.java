package com.irissoft.app.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import com.irissoft.app.business.ChatBusiness;
import com.irissoft.app.controller.reqresp.RequestMessageSend;
import com.irissoft.app.controller.reqresp.ResponseConversationGetAll;
import com.irissoft.app.controller.reqresp.ResponseMessagesGet;
import com.irissoft.app.dto.DtoMessage;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatBusiness chatBusiness;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private com.irissoft.app.business.NotificationBusiness notificationBusiness;

    @PostMapping("/send")
    public ResponseEntity<ResponseGeneric> sendMessage(@RequestBody RequestMessageSend request, Principal principal) {
        ResponseGeneric response = new ResponseGeneric() {
        };
        try {
            // 1. Guardar mensaje (Business devuelve DTO)
            DtoMessage newMessage = chatBusiness.sendMessage(
                    principal.getName(),
                    request.getProductId(),
                    request.getReceiverId(),
                    request.getContent());

            // 2. Notificar al chat (Socket)
            messagingTemplate.convertAndSend("/topic/messages/" + newMessage.getIdConversation(), newMessage);

            // 3. Crear notificación persistente para el receptor
            String senderName = chatBusiness.getUserNameByEmail(principal.getName());
            notificationBusiness.createNotification(
                request.getReceiverId(),
                "MESSAGE",
                "Nuevo mensaje de " + senderName,
                request.getContent().length() > 50 ? 
                    request.getContent().substring(0, 50) + "..." : 
                    request.getContent(),
                newMessage.getIdConversation()
            );

            // 4. Notificar al receptor del contador actualizado (Socket)
            long chatCount = chatBusiness.getUnreadCountByUserId(request.getReceiverId());
            messagingTemplate.convertAndSend("/topic/notifications/" + request.getReceiverId(), chatCount);
            
            // 5. Actualizar contador de notificaciones del sistema
            long notificationCount = notificationBusiness.getUnreadCount(
                chatBusiness.getEmailByUserId(request.getReceiverId())
            );
            messagingTemplate.convertAndSend("/topic/system-notifications/" + request.getReceiverId(), notificationCount);

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

        // 1. Business maneja la lógica de obtener y marcar leídos
        response.setListMessage(chatBusiness.getMessages(conversationId, principal.getName()));

        // 2. Obtener mi ID a través de Business (sin tocar Entidad en Controller)
        String myId = chatBusiness.getUserIdByEmail(principal.getName());

        // 3. Obtener mi nuevo conteo y notificarme por Socket
        long myNewCount = chatBusiness.getUnreadCountByUserId(myId);
        messagingTemplate.convertAndSend("/topic/notifications/" + myId, myNewCount);

        response.success();
        return ResponseEntity.ok(response);
    }
}