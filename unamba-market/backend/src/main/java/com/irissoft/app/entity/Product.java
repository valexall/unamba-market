package com.irissoft.app.entity;

import java.math.BigDecimal;
import java.util.List;

import com.irissoft.app.generic.EntityGeneric;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tproduct")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product extends EntityGeneric {

	@Id
	@Column(name = "idProduct", length = 36)
	private String idProduct;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idUser", nullable = false)
	private User user;

	// Relación muchos a muchos con Categoría
	@ManyToMany
	@JoinTable(name = "tproduct_category", joinColumns = @JoinColumn(name = "idProduct"), inverseJoinColumns = @JoinColumn(name = "idCategory"))
	private List<Category> categories;

	@Column(name = "name", nullable = false, length = 150)
	private String name;

	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Column(name = "price", nullable = false, precision = 10, scale = 2)
	private BigDecimal price;

	@Column(name = "productCondition", nullable = false, length = 20)
	private String productCondition; 

	@Column(name = "status", nullable = false, length = 20)
	private String status; 

	@Column(name = "viewCount")
	private Integer viewCount = 0;
}