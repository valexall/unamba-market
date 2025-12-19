package com.irissoft.app.business;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.irissoft.app.dataaccess.ProductRepository;
import com.irissoft.app.dataaccess.TransactionRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.entity.Product;
import com.irissoft.app.entity.Transaction;
import com.irissoft.app.entity.User;

@Service
public class TransactionBusiness {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public void createTransaction(String buyerEmail, String productId, BigDecimal amount) {
        User buyer = userRepository.findByEmail(buyerEmail).orElseThrow();
        Product product = productRepository.findById(productId).orElseThrow();
        
        if(product.getUser().getIdUser().equals(buyer.getIdUser())) {
            throw new RuntimeException("No puedes comprar tu propio producto");
        }

        Transaction t = new Transaction();
        t.setIdTransaction(UUID.randomUUID().toString());
        t.setBuyer(buyer);
        t.setSeller(product.getUser());
        t.setProduct(product);
        t.setAmount(amount);
        t.setStatus("COMPLETADO");
        t.setTransactionDate(LocalDateTime.now());
        t.setCreatedAt(LocalDateTime.now());
        t.setUpdatedAt(LocalDateTime.now());

        transactionRepository.save(t);

        product.setStatus("VENDIDO");
        productRepository.save(product);
    }
}