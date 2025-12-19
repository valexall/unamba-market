package com.irissoft.app.controller;

import java.math.BigDecimal;
import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.irissoft.app.business.TransactionBusiness;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/transaction")
public class TransactionController {

    @Autowired private TransactionBusiness transactionBusiness;

    @PostMapping("/create")
    public ResponseEntity<ResponseGeneric> createTransaction(
            @RequestParam String productId, 
            @RequestParam BigDecimal amount,
            Principal principal) {
        
        ResponseGeneric response = new ResponseGeneric() {};
        try {
            transactionBusiness.createTransaction(principal.getName(), productId, amount);
            response.success();
            response.listMessage.add("Compra registrada con éxito");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}