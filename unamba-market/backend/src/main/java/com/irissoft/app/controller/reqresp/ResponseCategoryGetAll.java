package com.irissoft.app.controller.reqresp;

import java.util.List;
import com.irissoft.app.dto.DtoCategory;
import com.irissoft.app.generic.ResponseGeneric;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseCategoryGetAll extends ResponseGeneric {
    private List<DtoCategory> listCategory;
}