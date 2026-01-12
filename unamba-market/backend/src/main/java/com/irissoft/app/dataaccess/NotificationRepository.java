package com.irissoft.app.dataaccess;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.irissoft.app.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, String> {
	
	List<Notification> findByUser_IdUserOrderByCreatedAtDesc(String idUser);
	
	@Query("SELECT COUNT(n) FROM Notification n WHERE n.user.idUser = :idUser AND n.isRead = false")
	Long countUnreadByUserId(@Param("idUser") String idUser);
	
	@Modifying
	@Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.idUser = :idUser AND n.isRead = false")
	void markAllAsReadByUserId(@Param("idUser") String idUser);
}
