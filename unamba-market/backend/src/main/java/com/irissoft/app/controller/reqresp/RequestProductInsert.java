package com.irissoft.app.controller.reqresp;

import org.springframework.web.multipart.MultipartFile;
import com.irissoft.app.dto.DtoProduct;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequestProductInsert {
    @Getter
    @Setter
    public class Dto {
        private DtoProduct product;
    }
    
    private Dto dto = new Dto();
    private MultipartFile image;
}