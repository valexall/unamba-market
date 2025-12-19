package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.DtoUser;
import com.irissoft.app.entity.User;
import com.irissoft.app.service.StorageService;

@Service
public class UserBusiness {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private StorageService storageService; // (Asumo que ya creaste este servicio básico)

    public boolean register(DtoUser dtoUser, MultipartFile imageFile) {
        // 1. Validaciones previas
        if (userRepository.existsByEmail(dtoUser.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // 2. Completar datos del DTO (Backend logic)
        dtoUser.setIdUser(UUID.randomUUID().toString());
        dtoUser.setCreatedAt(LocalDateTime.now());
        dtoUser.setUpdatedAt(LocalDateTime.now());
        dtoUser.setRole("STUDENT");
        dtoUser.setStatus("ACTIVO");

        // 3. Manejo de Imagen
        if (imageFile != null && !imageFile.isEmpty()) {
            String filename = storageService.store(imageFile);
            dtoUser.setProfileImage(filename);
        }

        // 4. Mapeo Manual DTO -> Entity (Igual que PersonBusiness)
        User user = new User();
        user.setIdUser(dtoUser.getIdUser());
        user.setEmail(dtoUser.getEmail());
        user.setPassword(passwordEncoder.encode(dtoUser.getPassword())); // Encriptar
        user.setFirstName(dtoUser.getFirstName());
        user.setLastName(dtoUser.getLastName());
        user.setCellphone(dtoUser.getCellphone());
        user.setProfileImage(dtoUser.getProfileImage());
        user.setRole(dtoUser.getRole());
        user.setStatus(dtoUser.getStatus());
        
        // Generic Entity fields
        user.setCreatedAt(dtoUser.getCreatedAt());
        user.setUpdatedAt(dtoUser.getUpdatedAt());

        // 5. Guardar
        this.userRepository.save(user);

        return true;
    }
}