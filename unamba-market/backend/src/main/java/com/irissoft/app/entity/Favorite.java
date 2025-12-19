package com.irissoft.app.entity;

import com.irissoft.app.generic.EntityGeneric;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tfavorite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Favorite extends EntityGeneric {

	@Id
	@Column(name = "idFavorite", length = 36)
	private String idFavorite;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idUser", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idProduct", nullable = false)
	private Product product;
}