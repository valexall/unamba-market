package com.irissoft.app.dataaccess;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.irissoft.app.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, String> {
    // Obtener transacciones de un usuario específico
    List<Transaction> findByBuyer_IdUser(String idUser);
    // Obtener transacciones de un usuario específico
    List<Transaction> findBySeller_IdUser(String idUser);
}