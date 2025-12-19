package com.irissoft.app.controller;

import java.security.Principal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.irissoft.app.business.ReviewBusiness;
import com.irissoft.app.controller.reqresp.RequestReviewInsert;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/review")
public class ReviewController {

    @Autowired private ReviewBusiness reviewBusiness;

    @PostMapping("/insert")
    public ResponseEntity<ResponseGeneric> insert(@RequestBody RequestReviewInsert request, Principal principal) {
        ResponseGeneric response = new ResponseGeneric() {};
        try {
            reviewBusiness.createReview(request.getReview(), principal.getName());
            response.success();
            response.listMessage.add("Reseña publicada");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.error();
            response.listMessage.add(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}