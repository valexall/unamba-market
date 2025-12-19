package com.irissoft.app.dataaccess;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.irissoft.app.entity.Message;

public interface MessageRepository extends JpaRepository<Message, String> {
        // Obtener todos los mensajes de una conversación específica, ordenados por fecha ascendente
        List<Message> findByConversation_IdConversationOrderByCreatedAtAsc(String idConversation);
       // Contar mensajes no leídos en una conversación específica para el usuario
        @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.idConversation = :convId AND m.isRead = false AND m.sender.idUser <> :myId")
        long countUnreadMessages(@Param("convId") String convId, @Param("myId") String myId);
       // Contar todos los mensajes no leídos en todas las conversaciones del usuario
        @Query("SELECT COUNT(m) FROM Message m JOIN m.conversation c " +
               "WHERE (c.buyer.idUser = :myId OR c.seller.idUser = :myId) " +
               "AND m.sender.idUser <> :myId AND m.isRead = false")
        long countTotalUnread(@Param("myId") String myId);
    }