package com.irissoft.app.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.irissoft.app.business.ProductBusiness;
import com.irissoft.app.controller.reqresp.RequestProductInsert;
import com.irissoft.app.controller.reqresp.ResponseProductGetAll;
import com.irissoft.app.controller.reqresp.ResponseProductInsert;
import com.irissoft.app.dto.DtoProduct;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/product")
public class ProductController {

    @Autowired
    private ProductBusiness productBusiness;

    @PostMapping(value = "/insert", consumes = "multipart/form-data")
    public ResponseEntity<ResponseProductInsert> insert(
            @ModelAttribute RequestProductInsert request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Principal principal) {
        ResponseProductInsert response = new ResponseProductInsert();
        try {
            this.productBusiness.insert(
                    request.getDto().getProduct(),
                    principal.getName(),
                    images);

            response.success();
            response.listMessage.add("Producto publicado correctamente");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/getall")
    public ResponseEntity<ResponseProductGetAll> getAll() {
        ResponseProductGetAll response = new ResponseProductGetAll();
        try {
            response.setListProduct(this.productBusiness.getAll());
            response.success();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseProductGetAll> getById(@PathVariable String id) {
        ResponseProductGetAll response = new ResponseProductGetAll();
        try {
            DtoProduct dto = productBusiness.getById(id);
            response.setListProduct(List.of(dto));
            response.success();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/my-inventory")
    public ResponseEntity<ResponseProductGetAll> getMyInventory(Principal principal) {
        ResponseProductGetAll response = new ResponseProductGetAll();
        try {
            response.setListProduct(this.productBusiness.getMyProducts(principal.getName()));
            response.success();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResponseGeneric> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            Principal principal) {

        ResponseGeneric response = new ResponseGeneric() {
        };
        try {
            this.productBusiness.updateStatus(id, status, principal.getName());
            response.success();
            response.listMessage.add("Estado actualizado a: " + status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ResponseProductInsert> update(
            @PathVariable String id,
            @ModelAttribute RequestProductInsert request,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            Principal principal) {
        ResponseProductInsert response = new ResponseProductInsert();
        try {
            this.productBusiness.update(
                    id,
                    request.getDto().getProduct(),
                    principal.getName(),
                    images);

            response.success();
            response.listMessage.add("Producto actualizado correctamente");
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}