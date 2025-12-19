package com.irissoft.app.entity;

import com.irissoft.app.generic.EntityGeneric;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "treview")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review extends EntityGeneric {

	@Id
	@Column(name = "idReview", length = 36)
	private String idReview;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idTransaction", nullable = false, unique = true)
	private Transaction transaction;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idReviewer", nullable = false)
	private User reviewer; 

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idReviewed", nullable = false)
	private User reviewed;

	@Column(name = "score", nullable = false)
	private Integer score;

	@Column(name = "comment", columnDefinition = "TEXT")
	private String comment;
}