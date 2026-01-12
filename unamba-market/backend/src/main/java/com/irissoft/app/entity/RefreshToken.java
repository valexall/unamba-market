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
@Table(name = "trefresh_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken extends EntityGeneric {

	@Id
	@Column(name = "idToken", length = 36)
	private String idToken;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idUser", nullable = false)
	private User user;

	@Column(name = "token", nullable = false, unique = true, length = 500)
	private String token;

	@Column(name = "expiryDate", nullable = false)
	private LocalDateTime expiryDate;

	@Column(name = "revoked")
	private Boolean revoked = false;
}
