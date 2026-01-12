package com.irissoft.app.dto;

public class RefreshTokenDto {
	
	public record TokenRefreshRequest(String refreshToken) {}
	
	public record TokenRefreshResponse(
		String accessToken,
		String refreshToken,
		String tokenType
	) {
		public TokenRefreshResponse(String accessToken, String refreshToken) {
			this(accessToken, refreshToken, "Bearer");
		}
	}
}
