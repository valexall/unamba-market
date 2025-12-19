package com.irissoft.app.dataaccess;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.irissoft.app.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, String> {
    
    // Obtener todas las reseñas hechas a un usuario específico
    List<Review> findByReviewed_IdUser(String idUser);
}