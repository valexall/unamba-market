package com.irissoft.app.dataaccess;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.irissoft.app.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    Optional<Category> findByNameIgnoreCase(String name);
}   