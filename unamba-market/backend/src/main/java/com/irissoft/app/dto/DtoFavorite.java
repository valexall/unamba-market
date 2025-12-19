package com.irissoft.app.dto;

import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

// DTO para Favorito
@Getter
@Setter
public class DtoFavorite extends DtoGeneric {
    private String idFavorite;
    private String productId;
    private String userId;
    private String productName;
    private String productImageUrl;
    private BigDecimal productPrice;
}