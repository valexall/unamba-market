package com.irissoft.app.dto;

import java.math.BigDecimal;
import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;


// DTO para Transacción
@Getter
@Setter
public class DtoTransaction extends DtoGeneric {
    private String idTransaction;
    private String idBuyer;
    private String idSeller;
    private String idProduct;
    private BigDecimal amount;
    private String status;
    private String productName;
    private String buyerName;
    private String sellerName;
}