package com.irissoft.app.business;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.irissoft.app.dataaccess.ReviewRepository;
import com.irissoft.app.dataaccess.TransactionRepository;
import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.dto.DtoReview;
import com.irissoft.app.entity.Review;
import com.irissoft.app.entity.Transaction;
import com.irissoft.app.entity.User;

@Service
public class ReviewBusiness {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private UserRepository userRepository;

    public void createReview(DtoReview dto, String reviewerEmail) {
        User reviewer = userRepository.findByEmail(reviewerEmail).orElseThrow();
        Transaction transaction = transactionRepository.findById(dto.getIdTransaction()).orElseThrow();

        // Validar que el usuario sea el comprador de esa transacción
        if(!transaction.getBuyer().getIdUser().equals(reviewer.getIdUser())) {
            throw new RuntimeException("Solo el comprador puede dejar reseña");
        }

        Review review = new Review();
        review.setIdReview(UUID.randomUUID().toString());
        review.setTransaction(transaction);
        review.setReviewer(reviewer);
        review.setReviewed(transaction.getSeller()); // Se califica al vendedor
        review.setScore(dto.getScore());
        review.setComment(dto.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        reviewRepository.save(review);
    }
}