package com.irissoft.app.dataaccess;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.irissoft.app.entity.ProductImage;

public interface ProductImageRepository extends JpaRepository<ProductImage, String> {
    List<ProductImage> findByProduct_IdProduct(String idProduct);
}