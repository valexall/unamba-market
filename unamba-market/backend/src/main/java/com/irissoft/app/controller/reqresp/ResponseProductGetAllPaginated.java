package com.irissoft.app.controller.reqresp;

import com.irissoft.app.dto.PageResponse;
import com.irissoft.app.dto.DtoProduct;
import com.irissoft.app.generic.ResponseGeneric;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResponseProductGetAllPaginated extends ResponseGeneric {
    private PageResponse<DtoProduct> data;
}
