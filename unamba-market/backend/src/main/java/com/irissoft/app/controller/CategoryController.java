package com.irissoft.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.irissoft.app.business.CategoryBusiness;
import com.irissoft.app.controller.reqresp.ResponseCategoryGetAll;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryBusiness categoryBusiness;

    @GetMapping("/getall")
    public ResponseEntity<ResponseCategoryGetAll> getAll() {
        ResponseCategoryGetAll response = new ResponseCategoryGetAll();
        
        try {
            response.setListCategory(this.categoryBusiness.getAll());
            response.success();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}