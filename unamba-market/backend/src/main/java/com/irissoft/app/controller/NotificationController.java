package com.irissoft.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.irissoft.app.business.NotificationBusiness;
import com.irissoft.app.dto.DtoNotification;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/notification")
public class NotificationController {

	@Autowired
	private NotificationBusiness notificationBusiness;

	@GetMapping("/my-notifications")
	public ResponseEntity<ResponseNotificationGetAll> getMyNotifications(Principal principal) {
		ResponseNotificationGetAll response = new ResponseNotificationGetAll();
		try {
			response.setListNotification(this.notificationBusiness.getMyNotifications(principal.getName()));
			response.success();
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.error();
			response.listMessage.add(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@GetMapping("/unread-count")
	public ResponseEntity<ResponseUnreadCount> getUnreadCount(Principal principal) {
		ResponseUnreadCount response = new ResponseUnreadCount();
		try {
			response.setCount(this.notificationBusiness.getUnreadCount(principal.getName()));
			response.success();
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.error();
			response.listMessage.add(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PatchMapping("/{id}/mark-read")
	public ResponseEntity<ResponseGeneric> markAsRead(@PathVariable String id, Principal principal) {
		ResponseGeneric response = new ResponseGeneric() {};
		try {
			this.notificationBusiness.markAsRead(id, principal.getName());
			response.success();
			response.listMessage.add("Notificación marcada como leída");
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.error();
			response.listMessage.add(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
	}

	@PatchMapping("/mark-all-read")
	public ResponseEntity<ResponseGeneric> markAllAsRead(Principal principal) {
		ResponseGeneric response = new ResponseGeneric() {};
		try {
			this.notificationBusiness.markAllAsRead(principal.getName());
			response.success();
			response.listMessage.add("Todas las notificaciones marcadas como leídas");
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.error();
			response.listMessage.add(e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
		}
	}

	// Response classes
	public static class ResponseNotificationGetAll extends ResponseGeneric {
		private List<DtoNotification> listNotification;

		public List<DtoNotification> getListNotification() {
			return listNotification;
		}

		public void setListNotification(List<DtoNotification> listNotification) {
			this.listNotification = listNotification;
		}
	}

	public static class ResponseUnreadCount extends ResponseGeneric {
		private Long count;

		public Long getCount() {
			return count;
		}

		public void setCount(Long count) {
			this.count = count;
		}
	}
}
