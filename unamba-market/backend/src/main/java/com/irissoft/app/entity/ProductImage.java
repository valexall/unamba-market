package com.irissoft.app.entity;

import com.irissoft.app.generic.EntityGeneric;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tproductimage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage extends EntityGeneric {

	@Id
	@Column(name = "idImage", length = 36)
	private String idImage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idProduct", nullable = false)
	private Product product;

	@Column(name = "imageUrl", nullable = false, length = 255)
	private String imageUrl;

	@Column(name = "isMain")
	private boolean isMain;
}