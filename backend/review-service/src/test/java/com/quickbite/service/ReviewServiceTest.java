package com.quickbite.service;

import com.quickbite.dto.ReviewDTO;
import com.quickbite.entity.Review;
import com.quickbite.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;

    @InjectMocks private ReviewService reviewService;

    private Review review;

    @BeforeEach
    void setup() {
        review = Review.builder()
                .id(1L)
                .orderId(1L)
                .customerId(1L)
                .restaurantId(1L)
                .restaurantRating(5)
                .deliveryRating(4)
                .isAnonymous(false)
                .build();
    }

    // ================= CREATE =================

    @Test
    void createReview_success() {
        when(reviewRepository.findByOrderId(any()))
                .thenReturn(Optional.empty());
        when(reviewRepository.save(any()))
                .thenReturn(review);

        ReviewDTO dto = new ReviewDTO();
        dto.setOrderId(1L);
        dto.setCustomerId(1L);
        dto.setRestaurantId(1L);
        dto.setRestaurantRating(5);

        ReviewDTO res = reviewService.createReview(dto);

        assertNotNull(res);
        verify(reviewRepository).save(any());
    }

    @Test
    void createReview_duplicate() {
        when(reviewRepository.findByOrderId(any()))
                .thenReturn(Optional.of(review));

        ReviewDTO dto = new ReviewDTO();
        dto.setOrderId(1L);

        assertThrows(RuntimeException.class,
                () -> reviewService.createReview(dto));
    }

    @Test
    void createReview_anonymousDefaultFalse() {
        when(reviewRepository.findByOrderId(any()))
                .thenReturn(Optional.empty());
        when(reviewRepository.save(any()))
                .thenReturn(review);

        ReviewDTO dto = new ReviewDTO();
        dto.setOrderId(1L);

        ReviewDTO res = reviewService.createReview(dto);

        assertFalse(res.getIsAnonymous());
    }

    // ================= GET =================

    @Test
    void getReview_success() {
        when(reviewRepository.findByOrderId(any()))
                .thenReturn(Optional.of(review));

        ReviewDTO res = reviewService.getReviewByOrderId(1L);

        assertEquals(1L, res.getOrderId());
    }

    @Test
    void getReview_notFound() {
        when(reviewRepository.findByOrderId(any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> reviewService.getReviewByOrderId(1L));
    }

    // ================= LIST =================

    @Test
    void getRestaurantReviews_success() {
        when(reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(any()))
                .thenReturn(List.of(review));

        assertEquals(1,
                reviewService.getRestaurantReviews(1L).size());
    }

    @Test
    void getCustomerReviews_success() {
        when(reviewRepository.findByCustomerIdOrderByCreatedAtDesc(any()))
                .thenReturn(List.of(review));

        assertEquals(1,
                reviewService.getCustomerReviews(1L).size());
    }

    @Test
    void getDeliveryAgentReviews_success() {
        when(reviewRepository.findByDeliveryAgentIdOrderByCreatedAtDesc(any()))
                .thenReturn(List.of(review));

        assertEquals(1,
                reviewService.getDeliveryAgentReviews(1L).size());
    }

    @Test
    void getAllReviews_success() {
        when(reviewRepository.findAll())
                .thenReturn(List.of(review));

        assertEquals(1,
                reviewService.getAllReviews().size());
    }

    // ================= AVG =================

    @Test
    void getRestaurantAvg_success() {
        when(reviewRepository.getAverageRestaurantRating(any()))
                .thenReturn(4.5);

        assertEquals(4.5,
                reviewService.getRestaurantAverageRating(1L));
    }

    @Test
    void getRestaurantAvg_nullFallback() {
        when(reviewRepository.getAverageRestaurantRating(any()))
                .thenReturn(null);

        assertEquals(0.0,
                reviewService.getRestaurantAverageRating(1L));
    }

    @Test
    void getDeliveryAvg_success() {
        when(reviewRepository.getAverageDeliveryRating(any()))
                .thenReturn(4.0);

        assertEquals(4.0,
                reviewService.getDeliveryAgentAverageRating(1L));
    }

    @Test
    void getDeliveryAvg_nullFallback() {
        when(reviewRepository.getAverageDeliveryRating(any()))
                .thenReturn(null);

        assertEquals(0.0,
                reviewService.getDeliveryAgentAverageRating(1L));
    }
}