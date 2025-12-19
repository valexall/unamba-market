package com.irissoft.app.controller.reqresp;

import org.springframework.web.multipart.MultipartFile;
import com.irissoft.app.dto.DtoUser;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestUserRegister {
    
    @Getter
    @Setter
    public class Dto {
        private DtoUser user;
    }
    
    private Dto dto = new Dto();

    private MultipartFile profileImage; 
}