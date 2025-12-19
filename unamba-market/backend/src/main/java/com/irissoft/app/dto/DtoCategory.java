package com.irissoft.app.dto;

import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;

// DTO para Categoría
@Getter
@Setter
public class DtoCategory extends DtoGeneric {
    private String idCategory;
    private String name;
    private String description;
    private String iconCode;
    private String slug;
}