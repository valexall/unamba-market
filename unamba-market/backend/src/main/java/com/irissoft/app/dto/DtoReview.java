package com.irissoft.app.dto;

import com.irissoft.app.generic.DtoGeneric;
import lombok.Getter;
import lombok.Setter;


// DTO para Reseña
@Getter
@Setter
public class DtoReview extends DtoGeneric {
    private String idReview;
    private String idTransaction;
    private String idReviewer;
    private String idReviewed;
    private Integer score;
    private String comment;
    private String reviewerName;
    private String reviewerImage;
}