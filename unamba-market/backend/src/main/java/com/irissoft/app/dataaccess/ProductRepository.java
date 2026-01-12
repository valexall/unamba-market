package com.irissoft.app.dataaccess;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.irissoft.app.entity.Product;

public interface ProductRepository extends JpaRepository<Product, String> {
    
    // Productos por categoría y estado
    @Query("SELECT p FROM Product p JOIN p.categories c WHERE c.idCategory = :idCategory AND p.status = :status")
    List<Product> findByCategoryIdAndStatus(@Param("idCategory") String idCategory, @Param("status") String status);
    
    // Productos de un usuario específico
    List<Product> findByUser_IdUser(String idUser);
    
    // Búsqueda simple por nombre
    List<Product> findByNameContainingIgnoreCaseAndStatus(String name, String status);

    // Búsqueda por nombre con paginación
    Page<Product> findByNameContainingIgnoreCaseAndStatusOrderByCreatedAtDesc(String name, String status, Pageable pageable);

    List<Product> findByStatusOrderByCreatedAtDesc(String status);

    // Métodos con paginación
    Page<Product> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    Page<Product> findByUser_IdUser(String idUser, Pageable pageable);
    
    @Query("SELECT p FROM Product p JOIN p.categories c WHERE c.idCategory = :idCategory AND p.status = :status")
    Page<Product> findByCategoryIdAndStatus(@Param("idCategory") String idCategory, @Param("status") String status, Pageable pageable);

}