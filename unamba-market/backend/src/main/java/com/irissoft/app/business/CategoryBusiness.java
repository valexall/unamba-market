package com.irissoft.app.business;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.irissoft.app.dataaccess.CategoryRepository;
import com.irissoft.app.dto.DtoCategory;
import com.irissoft.app.entity.Category;

@Service
public class CategoryBusiness {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<DtoCategory> getAll() {
        List<Category> listEntities = categoryRepository.findAll();
        List<DtoCategory> listDtos = new ArrayList<>();

        for (Category entity : listEntities) {
            DtoCategory dto = new DtoCategory();
            dto.setIdCategory(entity.getIdCategory());
            dto.setName(entity.getName());
            dto.setDescription(entity.getDescription());
            dto.setIconCode(entity.getIconCode());
            dto.setSlug(entity.getSlug());
            dto.setCreatedAt(entity.getCreatedAt());
            dto.setUpdatedAt(entity.getUpdatedAt());

            listDtos.add(dto);
        }
        return listDtos;
    }
}