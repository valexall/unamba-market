package com.irissoft.app.dataaccess;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.irissoft.app.entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, String> {
    
    @Query("SELECT c FROM Conversation c WHERE c.buyer.idUser = :idUser OR c.seller.idUser = :idUser ORDER BY c.lastMessageAt DESC")
    List<Conversation> findMyConversations(String idUser);

    @Query("SELECT c FROM Conversation c WHERE c.product.idProduct = :idProduct AND c.buyer.idUser = :idBuyer AND c.seller.idUser = :idSeller")
    Optional<Conversation> findExistingChat(String idProduct, String idBuyer, String idSeller);
}