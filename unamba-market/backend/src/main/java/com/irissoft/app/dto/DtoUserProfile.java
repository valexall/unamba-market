package com.irissoft.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DtoUserProfile {
	private String idUser;
	private String email;
	private String firstName;
	private String lastName;
	private String phone;
	private String address;
	private String dni;
	private String profileImage;
	private String bio;
	private Integer totalProducts;
	private Integer totalSales;
}
