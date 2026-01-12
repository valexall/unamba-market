package com.irissoft.app.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.irissoft.app.auxobject.JwtProperties;
import com.irissoft.app.dataaccess.RefreshTokenRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.entity.RefreshToken;
import com.irissoft.app.entity.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

	private final RefreshTokenRepository refreshTokenRepository;
	private final UserRepository userRepository;
	private final JwtProperties jwtProperties;

	@Transactional
	public RefreshToken createRefreshToken(String email) {
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		// Revocar tokens anteriores del usuario
		refreshTokenRepository.revokeAllByUserId(user.getIdUser());

		RefreshToken refreshToken = new RefreshToken();
		refreshToken.setIdToken(UUID.randomUUID().toString());
		refreshToken.setUser(user);
		refreshToken.setToken(UUID.randomUUID().toString());
		refreshToken.setExpiryDate(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshTokenDurationMs() / 1000));
		refreshToken.setRevoked(false);
		refreshToken.setCreatedAt(LocalDateTime.now());
		refreshToken.setUpdatedAt(LocalDateTime.now());

		return refreshTokenRepository.save(refreshToken);
	}

	public Optional<RefreshToken> findByToken(String token) {
		return refreshTokenRepository.findByToken(token);
	}

	public RefreshToken verifyExpiration(RefreshToken token) {
		if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
			refreshTokenRepository.delete(token);
			throw new RuntimeException("El refresh token ha expirado. Por favor inicia sesión nuevamente.");
		}
		return token;
	}

	@Transactional
	public void revokeByUser(String userId) {
		refreshTokenRepository.revokeAllByUserId(userId);
	}
}
