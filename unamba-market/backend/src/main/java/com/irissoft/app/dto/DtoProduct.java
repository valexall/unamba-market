package com.irissoft.app.dto;

import java.math.BigDecimal;
import java.util.List;
import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;


// DTO para Producto
@Getter
@Setter
public class DtoProduct extends DtoGeneric {
    private String idProduct;
    private String name;
    private String description;
    private BigDecimal price;
    private String productCondition;
    private String status;
    private String imageUrl;
    private List<String> images;
    private Integer viewCount;
    private List<String> categoryNames; 
    private String categoryName; 
    private String userId; 
    private String sellerName;
    private String sellerId;
    private String categoryId; 
}