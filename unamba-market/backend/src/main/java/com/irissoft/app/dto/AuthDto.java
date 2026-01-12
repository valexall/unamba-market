package com.irissoft.app.dto;

public class AuthDto {
    
    public record LoginRequest(String email, String password) {}

    public record AuthResponse(
        String token,
        String refreshToken,
        String role, 
        String firstName, 
        String profileImage
    ) {} 

}