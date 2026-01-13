package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.irissoft.app.dataaccess.ProductRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.DtoUser;
import com.irissoft.app.dto.DtoUserProfile;
import com.irissoft.app.entity.User;
import com.irissoft.app.service.StorageService;

@Service
public class UserBusiness {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private StorageService storageService;
    
    @Autowired
    private ProductRepository productRepository;

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
    
    public DtoUserProfile getProfile(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        DtoUserProfile profile = new DtoUserProfile();
        profile.setIdUser(user.getIdUser());
        profile.setEmail(user.getEmail());
        profile.setFirstName(user.getFirstName());
        profile.setLastName(user.getLastName());
        profile.setPhone(user.getPhone());
        profile.setAddress(user.getAddress());
        profile.setDni(user.getDni());
        profile.setProfileImage(user.getProfileImage());
        profile.setBio(user.getBio());
        
        // Calcular estadísticas
        int totalProducts = productRepository.findByUser_IdUser(user.getIdUser()).size();
        profile.setTotalProducts(totalProducts);
        profile.setTotalSales(0); 
        return profile;
    }
    
    @Transactional
    public boolean updateProfile(String userEmail, String firstName, String lastName, 
                                 String phone, String address, String bio, MultipartFile imageFile) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Actualizar campos
        if (firstName != null && !firstName.isEmpty()) {
            user.setFirstName(firstName);
        }
        if (lastName != null && !lastName.isEmpty()) {
            user.setLastName(lastName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (address != null) {
            user.setAddress(address);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        
        // Actualizar imagen de perfil si se proporciona
        if (imageFile != null && !imageFile.isEmpty()) {
            String filename = storageService.store(imageFile);
            user.setProfileImage(filename);
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return true;
    }
}