package com.irissoft.app.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.irissoft.app.generic.EntityGeneric;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ttransaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends EntityGeneric {

	@Id
	@Column(name = "idTransaction", length = 36)
	private String idTransaction;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idBuyer", nullable = false)
	private User buyer;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idSeller", nullable = false)
	private User seller;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "idProduct", nullable = false)
	private Product product;

	@Column(name = "amount", nullable = false, precision = 10, scale = 2)
	private BigDecimal amount;

	@Column(name = "status", length = 20)
	private String status;

	@Column(name = "transactionDate")
	private LocalDateTime transactionDate;
}