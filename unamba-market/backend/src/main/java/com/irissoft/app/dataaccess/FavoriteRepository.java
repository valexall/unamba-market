package com.irissoft.app.dataaccess;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.irissoft.app.entity.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite, String> {
    List<Favorite> findByUser_IdUser(String idUser);
    Optional<Favorite> findByUser_IdUserAndProduct_IdProduct(String idUser, String idProduct);
}