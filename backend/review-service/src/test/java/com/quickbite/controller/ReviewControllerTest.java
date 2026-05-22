package com.quickbite.controller;

import com.quickbite.dto.ReviewDTO;
import com.quickbite.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewControllerTest {

    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private ReviewController reviewController;

    private ReviewDTO review;

    @BeforeEach
    void setUp() {
        review = ReviewDTO.builder()
                .id(1L)
                .orderId(10L)
                .customerId(20L)
                .restaurantId(30L)
                .restaurantRating(5)
                .deliveryRating(4)
                .deliveryAgentId(40L)
                .isAnonymous(false)
                .build();
    }

    @Test
    void createReviewReturnsCreatedReview() {
        when(reviewService.createReview(review)).thenReturn(review);

        ResponseEntity<ReviewDTO> response = reviewController.createReview(review);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(review, response.getBody());
    }

    @Test
    void getReviewByOrderReturnsReviewWhenFound() {
        when(reviewService.getReviewByOrderId(10L)).thenReturn(review);

        ResponseEntity<ReviewDTO> response = reviewController.getReviewByOrder(10L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(review, response.getBody());
    }

    @Test
    void getReviewByOrderReturnsNotFoundWhenMissing() {
        when(reviewService.getReviewByOrderId(10L)).thenThrow(new RuntimeException("missing"));

        ResponseEntity<ReviewDTO> response = reviewController.getReviewByOrder(10L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void listEndpointsReturnReviews() {
        when(reviewService.getRestaurantReviews(30L)).thenReturn(List.of(review));
        when(reviewService.getCustomerReviews(20L)).thenReturn(List.of(review));
        when(reviewService.getDeliveryAgentReviews(40L)).thenReturn(List.of(review));
        when(reviewService.getAllReviews()).thenReturn(List.of(review));

        assertEquals(List.of(review), reviewController.getRestaurantReviews(30L).getBody());
        assertEquals(List.of(review), reviewController.getCustomerReviews(20L).getBody());
        assertEquals(List.of(review), reviewController.getDeliveryAgentReviews(40L).getBody());
        assertEquals(List.of(review), reviewController.getAllReviews().getBody());
    }

    @Test
    void ratingEndpointsReturnAverages() {
        when(reviewService.getRestaurantAverageRating(30L)).thenReturn(4.5);
        when(reviewService.getDeliveryAgentAverageRating(40L)).thenReturn(4.0);

        assertEquals(4.5, reviewController.getRestaurantRating(30L).getBody());
        assertEquals(4.0, reviewController.getDeliveryAgentRating(40L).getBody());
    }
}
