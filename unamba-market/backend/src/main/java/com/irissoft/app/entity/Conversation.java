package com.irissoft.app.entity;

import java.time.LocalDateTime;
import com.irissoft.app.generic.EntityGeneric;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tconversation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Conversation extends EntityGeneric {

	@Id
	@Column(name = "idConversation", length = 36)
	private String idConversation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idProduct", nullable = false)
	private Product product;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idBuyer", nullable = false)
	private User buyer;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idSeller", nullable = false)
	private User seller;

	@Column(name = "lastMessageAt", nullable = false)
	private LocalDateTime lastMessageAt;
}