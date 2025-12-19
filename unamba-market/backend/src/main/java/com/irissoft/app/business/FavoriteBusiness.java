package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.irissoft.app.dataaccess.FavoriteRepository;
import com.irissoft.app.dataaccess.ProductRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.entity.Favorite;
import com.irissoft.app.entity.Product;
import com.irissoft.app.entity.User;

@Service
public class FavoriteBusiness {

    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    public boolean toggleFavorite(String userEmail, String productId) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        
        Optional<Favorite> existing = favoriteRepository.findByUser_IdUserAndProduct_IdProduct(user.getIdUser(), productId);
        
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // Eliminado
        } else {
            Product product = productRepository.findById(productId).orElseThrow();
            Favorite fav = new Favorite();
            fav.setIdFavorite(UUID.randomUUID().toString());
            fav.setUser(user);
            fav.setProduct(product);
            fav.setCreatedAt(LocalDateTime.now());
            fav.setUpdatedAt(LocalDateTime.now());
            
            favoriteRepository.save(fav);
            return true; // Agregado
        }
    }
}