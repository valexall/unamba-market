package com.irissoft.app.entity;

import com.irissoft.app.generic.EntityGeneric;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tmessage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message extends EntityGeneric {

	@Id
	@Column(name = "idMessage", length = 36)
	private String idMessage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idConversation", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idSender", nullable = false)
	private User sender;

	@Column(name = "content", columnDefinition = "TEXT", nullable = false)
	private String content;

	@Column(name = "isRead")
	private boolean isRead;
}