package com.irissoft.app.dto;

import com.irissoft.app.generic.DtoGeneric; // <--- Ahora sí lo encontrará
import lombok.Getter;
import lombok.Setter;


// DTO para Usuario
@Getter
@Setter
public class DtoUser extends DtoGeneric {
    private String idUser;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String cellphone;
    private String profileImage;
    private String role;
    private String status;
}