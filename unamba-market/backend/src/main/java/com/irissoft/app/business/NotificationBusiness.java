package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.irissoft.app.dataaccess.NotificationRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.DtoNotification;
import com.irissoft.app.entity.Notification;
import com.irissoft.app.entity.User;

@Service
public class NotificationBusiness {

	@Autowired
	private NotificationRepository notificationRepository;
	
	@Autowired
	private UserRepository userRepository;

	public List<DtoNotification> getMyNotifications(String userEmail) {
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		List<Notification> notifications = notificationRepository
				.findByUser_IdUserOrderByCreatedAtDesc(user.getIdUser());

		List<DtoNotification> dtoList = new ArrayList<>();
		for (Notification n : notifications) {
			DtoNotification dto = new DtoNotification();
			dto.setIdNotification(n.getIdNotification());
			dto.setType(n.getType());
			dto.setTitle(n.getTitle());
			dto.setMessage(n.getMessage());
			dto.setRelatedId(n.getRelatedId());
			dto.setIsRead(n.getIsRead());
			dto.setCreatedAt(n.getCreatedAt());
			dto.setReadAt(n.getReadAt());
			dtoList.add(dto);
		}

		return dtoList;
	}

	public Long getUnreadCount(String userEmail) {
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		return notificationRepository.countUnreadByUserId(user.getIdUser());
	}

	@Transactional
	public void markAsRead(String notificationId, String userEmail) {
		Notification notification = notificationRepository.findById(notificationId)
				.orElseThrow(() -> new RuntimeException("Notificación no encontrada"));

		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		if (!notification.getUser().getIdUser().equals(user.getIdUser())) {
			throw new RuntimeException("No tienes permiso para marcar esta notificación");
		}

		notification.setIsRead(true);
		notification.setReadAt(LocalDateTime.now());
		notificationRepository.save(notification);
	}

	@Transactional
	public void markAllAsRead(String userEmail) {
		User user = userRepository.findByEmail(userEmail)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
		notificationRepository.markAllAsReadByUserId(user.getIdUser());
	}

	@Transactional
	public void createNotification(String userId, String type, String title, String message, String relatedId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		Notification notification = new Notification();
		notification.setIdNotification(UUID.randomUUID().toString());
		notification.setUser(user);
		notification.setType(type);
		notification.setTitle(title);
		notification.setMessage(message);
		notification.setRelatedId(relatedId);
		notification.setIsRead(false);

		notificationRepository.save(notification);
	}
}
