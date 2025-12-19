package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.irissoft.app.dataaccess.ConversationRepository;
import com.irissoft.app.dataaccess.MessageRepository;
import com.irissoft.app.dataaccess.ProductRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.DtoConversation;
import com.irissoft.app.dto.DtoMessage;
import com.irissoft.app.entity.Conversation;
import com.irissoft.app.entity.Message;
import com.irissoft.app.entity.Product;
import com.irissoft.app.entity.User;

@Service
public class ChatBusiness {

    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public void sendMessage(String senderEmail, String productId, String receiverId, String content) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receptor no encontrado"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Validar lógica: No chatear contigo mismo
        if (sender.getIdUser().equals(receiverId)) {
            throw new RuntimeException("No puedes iniciar un chat contigo mismo.");
        }

        // Buscar chat existente (idéntico al anterior pero con paquetes irissoft)
        Optional<Conversation> existingConv = conversationRepository.findExistingChat(productId, sender.getIdUser(),
                receiverId);
        if (existingConv.isEmpty()) {
            existingConv = conversationRepository.findExistingChat(productId, receiverId, sender.getIdUser());
        }

        Conversation conversation;
        if (existingConv.isPresent()) {
            conversation = existingConv.get();
        } else {
            conversation = new Conversation();
            conversation.setIdConversation(UUID.randomUUID().toString());
            conversation.setProduct(product);
            conversation.setBuyer(sender);
            conversation.setSeller(receiver);
            conversation.setCreatedAt(LocalDateTime.now());
            conversation.setUpdatedAt(LocalDateTime.now());
        }

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        Message msg = new Message();
        msg.setIdMessage(UUID.randomUUID().toString());
        msg.setConversation(conversation);
        msg.setSender(sender);
        msg.setContent(content);
        msg.setRead(false);
        msg.setCreatedAt(LocalDateTime.now());
        msg.setUpdatedAt(LocalDateTime.now());

        messageRepository.save(msg);
    }

    public List<DtoConversation> getMyConversations(String userEmail) {
        User me = userRepository.findByEmail(userEmail).orElseThrow();
        List<Conversation> entities = conversationRepository.findMyConversations(me.getIdUser());
        List<DtoConversation> dtos = new ArrayList<>();

        for (Conversation c : entities) {
            DtoConversation dto = new DtoConversation();
            dto.setIdConversation(c.getIdConversation());
            dto.setIdProduct(c.getProduct().getIdProduct());
            dto.setProductName(c.getProduct().getName());
            dto.setLastMessageAt(c.getLastMessageAt());
            User otherUser = c.getBuyer().getIdUser().equals(me.getIdUser()) ? c.getSeller() : c.getBuyer();
            dto.setOtherUserProfileImage(otherUser.getProfileImage());
            dto.setOtherUserId(otherUser.getIdUser());
            dto.setOtherUserName(otherUser.getFirstName() + " " + otherUser.getLastName());
            dto.setOtherUserProfileImage(otherUser.getProfileImage());
            dto.setLastMessageAt(c.getLastMessageAt());
            long unread = messageRepository.countUnreadMessages(c.getIdConversation(), me.getIdUser());
            dto.setUnreadCount((int) unread);
            dtos.add(dto);
        }
        return dtos;
    }

    @Transactional // Importante
    public List<DtoMessage> getMessages(String conversationId, String userEmail) {
        User me = userRepository.findByEmail(userEmail).orElseThrow();

        List<Message> entities = messageRepository.findByConversation_IdConversationOrderByCreatedAtAsc(conversationId);
        List<DtoMessage> dtos = new ArrayList<>();
        for (Message m : entities) {
            if (!m.getSender().getIdUser().equals(me.getIdUser()) && !m.isRead()) {
                m.setRead(true);
                messageRepository.save(m);
            }
            DtoMessage dto = new DtoMessage();
            dto.setIdMessage(m.getIdMessage());
            dto.setContent(m.getContent());
            dto.setIdSender(m.getSender().getIdUser());
            dto.setCreatedAt(m.getCreatedAt());
            dto.setRead(m.isRead());
            dtos.add(dto);
        }
        return dtos;
    }

    public long getTotalUnread(String userEmail) {
        User me = userRepository.findByEmail(userEmail).orElseThrow();
        return messageRepository.countTotalUnread(me.getIdUser());
    }

}