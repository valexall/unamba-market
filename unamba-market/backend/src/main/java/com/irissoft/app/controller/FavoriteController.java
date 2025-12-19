package com.irissoft.app.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.irissoft.app.business.FavoriteBusiness;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/favorite")
public class FavoriteController {

    @Autowired private FavoriteBusiness favoriteBusiness;

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<ResponseGeneric> toggle(@PathVariable String productId, Principal principal) {
        ResponseGeneric response = new ResponseGeneric() {};
        try {
            boolean added = favoriteBusiness.toggleFavorite(principal.getName(), productId);
            response.success();
            response.listMessage.add(added ? "Agregado a favoritos" : "Eliminado de favoritos");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            return ResponseEntity.badRequest().body(response);
        }
    }
}