package com.irissoft.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.irissoft.app.business.UserBusiness;
import com.irissoft.app.controller.reqresp.RequestUserRegister;
import com.irissoft.app.controller.reqresp.ResponseUserRegister;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.AuthDto;
import com.irissoft.app.dto.RefreshTokenDto;
import com.irissoft.app.entity.RefreshToken;
import com.irissoft.app.entity.User;
import com.irissoft.app.security.JwtService;
import com.irissoft.app.service.RefreshTokenService;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserBusiness userBusiness;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isPresent() && passwordEncoder.matches(request.password(), userOpt.get().getPassword())) {
             if (!"ACTIVO".equals(userOpt.get().getStatus())) {
                 return ResponseEntity.status(403).body("Usuario inactivo");
             }
             String token = jwtService.generateToken(userOpt.get());
             RefreshToken refreshToken = refreshTokenService.createRefreshToken(request.email());
             
             return ResponseEntity.ok(new AuthDto.AuthResponse(
                 token, 
                 refreshToken.getToken(),
                 userOpt.get().getRole(), 
                 userOpt.get().getFirstName(), 
                 userOpt.get().getProfileImage()
             ));
        }
        return ResponseEntity.status(401).body("Credenciales incorrectas");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenDto.TokenRefreshRequest request) {
        String requestRefreshToken = request.refreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
            .map(refreshTokenService::verifyExpiration)
            .map(RefreshToken::getUser)
            .map(user -> {
                String newAccessToken = jwtService.generateToken(user);
                return ResponseEntity.ok(new RefreshTokenDto.TokenRefreshResponse(
                    newAccessToken, 
                    requestRefreshToken
                ));
            })
            .orElseThrow(() -> new RuntimeException("Refresh token no encontrado"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenDto.TokenRefreshRequest request) {
        refreshTokenService.findByToken(request.refreshToken())
            .ifPresent(token -> refreshTokenService.revokeByUser(token.getUser().getIdUser()));
        return ResponseEntity.ok("Sesión cerrada correctamente");
    }

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<ResponseUserRegister> register(@ModelAttribute RequestUserRegister request) {
        
        ResponseUserRegister response = new ResponseUserRegister();
        
        try {

            this.userBusiness.register(request.getDto().getUser(), request.getProfileImage());
            
            response.success();
            response.listMessage.add("Usuario registrado correctamente");
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}