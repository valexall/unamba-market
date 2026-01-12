package com.irissoft.app.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DtoNotification {
	private String idNotification;
	private String type;
	private String title;
	private String message;
	private String relatedId;
	private Boolean isRead;
	private LocalDateTime createdAt;
	private LocalDateTime readAt;
}
