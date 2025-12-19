package com.irissoft.app.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name = "tuser")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User extends EntityGeneric {

	@Id
	@Column(name = "idUser", length = 36)
	private String idUser;

	@Column(name = "email", nullable = false, unique = true, length = 100)
	private String email;

	@Column(name = "password", nullable = false, length = 255)
	private String password;

	@Column(name = "firstName", nullable = false, length = 100)
	private String firstName;

	@Column(name = "lastName", nullable = false, length = 100)
	private String lastName;

	@Column(name = "cellphone", length = 20)
	private String cellphone;

	@Column(name = "profileImage", length = 255)
	private String profileImage;

	@Column(name = "role", nullable = false, length = 20)
	private String role;

	@Column(name = "status", length = 20)
	private String status; 
	
	@Column(name = "lastLoginAt")
	private LocalDateTime lastLoginAt;

	@Column(name = "averageRating", precision = 3, scale = 2)
	private BigDecimal averageRating;

	@Column(name = "totalReviewsReceived")
	private Integer totalReviewsReceived;
}