package com.quickbite.service;

import com.quickbite.dto.ReviewDTO;
import com.quickbite.entity.Review;
import com.quickbite.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewService reviewService;

    private Review testReview;

    @BeforeEach
    void setUp() {
        testReview = new Review();
        testReview.setId(1L);
        testReview.setOrderId(1L);
        testReview.setUserId(1L);
        testReview.setRestaurantId(1L);
        testReview.setRestaurantRating(5);
        testReview.setDeliveryRating(4);
    }

    @Test
    void getReviewById_Success() {
        when(reviewRepository.findById(anyLong())).thenReturn(Optional.of(testReview));

        ReviewDTO result = reviewService.getReviewById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(reviewRepository).findById(1L);
    }

    @Test
    void getReviewsByRestaurant_Success() {
        when(reviewRepository.findByRestaurantId(anyLong())).thenReturn(Arrays.asList(testReview));

        List<ReviewDTO> results = reviewService.getReviewsByRestaurant(1L);

        assertNotNull(results);
        assertEquals(1, results.size());
    }

    @Test
    void createReview_Success() {
        when(reviewRepository.save(any(Review.class))).thenReturn(testReview);

        ReviewDTO dto = new ReviewDTO();
        dto.setOrderId(1L);
        dto.setUserId(1L);
        dto.setRestaurantId(1L);
        dto.setRestaurantRating(5);

        ReviewDTO result = reviewService.createReview(dto);

        assertNotNull(result);
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void getAverageRestaurantRating_Success() {
        when(reviewRepository.getAverageRestaurantRating(anyLong())).thenReturn(4.5);

        Double result = reviewService.getAverageRestaurantRating(1L);

        assertNotNull(result);
        assertEquals(4.5, result);
    }

    @Test
    void deleteReview_Success() {
        when(reviewRepository.existsById(anyLong())).thenReturn(true);
        doNothing().when(reviewRepository).deleteById(anyLong());

        reviewService.deleteReview(1L);

        verify(reviewRepository).deleteById(1L);
    }
}
