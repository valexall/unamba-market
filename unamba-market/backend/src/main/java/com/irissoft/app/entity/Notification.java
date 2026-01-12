package com.irissoft.app.entity;

import java.time.LocalDateTime;

import com.irissoft.app.generic.EntityGeneric;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tnotification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends EntityGeneric {

	@Id
	@Column(name = "idNotification", length = 36)
	private String idNotification;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idUser", nullable = false)
	private User user;

	@Column(name = "type", length = 50, nullable = false)
	private String type; // MESSAGE, PRODUCT_SOLD, PRODUCT_INTEREST, SYSTEM

	@Column(name = "title", length = 200, nullable = false)
	private String title;

	@Column(name = "message", columnDefinition = "TEXT")
	private String message;

	@Column(name = "relatedId", length = 36)
	private String relatedId; // ID del producto, mensaje, etc.

	@Column(name = "isRead")
	private Boolean isRead = false;

	@Column(name = "readAt")
	private LocalDateTime readAt;
}
