package com.irissoft.app.entity;

import com.irissoft.app.generic.EntityGeneric;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tcategory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category extends EntityGeneric {

	@Id
	@Column(name = "idCategory", length = 36)
	private String idCategory;

	@Column(name = "name", nullable = false, length = 50)
	private String name;

	@Column(name = "description", length = 255)
	private String description;

	@Column(name = "iconCode", length = 50)
	private String iconCode;

	@Column(name = "slug", nullable = false, unique = true, length = 50)
	private String slug;
}