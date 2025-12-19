package com.irissoft.app.dataaccess;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.irissoft.app.entity.User;

public interface UserRepository extends JpaRepository<User, String> {

    // Buscar usuario por correo electrónico
    Optional<User> findByEmail(String email);
    // Verificar si un correo electrónico ya está registrado
    boolean existsByEmail(String email);
}