package com.irissoft.app.controller.reqresp;
import java.util.List;
import com.irissoft.app.dto.DtoProduct;
import com.irissoft.app.generic.ResponseGeneric;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseProductGetAll extends ResponseGeneric {
    private List<DtoProduct> listProduct;
}