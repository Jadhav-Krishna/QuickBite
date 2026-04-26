package com.quickbite.service;

import com.quickbite.dto.ReviewDTO;
import com.quickbite.entity.Review;
import com.quickbite.repository.ReviewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public ReviewDTO createReview(ReviewDTO request) {
        log.info("Creating review for order: {}", request.getOrderId());
        
        if (reviewRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new RuntimeException("Review already exists for order " + request.getOrderId());
        }

        Review review = Review.builder()
                .orderId(request.getOrderId())
                .customerId(request.getCustomerId())
                .restaurantId(request.getRestaurantId())
                .restaurantRating(request.getRestaurantRating())
                .restaurantReview(request.getRestaurantReview())
                .deliveryRating(request.getDeliveryRating())
                .deliveryReview(request.getDeliveryReview())
                .deliveryAgentId(request.getDeliveryAgentId())
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created with ID: {}", savedReview.getId());
        
        return mapToDTO(savedReview);
    }

    public ReviewDTO getReviewByOrderId(Long orderId) {
        Review review = reviewRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Review not found for order: " + orderId));
        return mapToDTO(review);
    }

    public List<ReviewDTO> getRestaurantReviews(Long restaurantId) {
        return reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getCustomerReviews(Long customerId) {
        return reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getDeliveryAgentReviews(Long deliveryAgentId) {
        return reviewRepository.findByDeliveryAgentIdOrderByCreatedAtDesc(deliveryAgentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Double getRestaurantAverageRating(Long restaurantId) {
        Double avg = reviewRepository.getAverageRestaurantRating(restaurantId);
        return avg != null ? avg : 0.0;
    }

    public Double getDeliveryAgentAverageRating(Long deliveryAgentId) {
        Double avg = reviewRepository.getAverageDeliveryRating(deliveryAgentId);
        return avg != null ? avg : 0.0;
    }

    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ReviewDTO mapToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .orderId(review.getOrderId())
                .customerId(review.getCustomerId())
                .restaurantId(review.getRestaurantId())
                .restaurantRating(review.getRestaurantRating())
                .restaurantReview(review.getRestaurantReview())
                .deliveryRating(review.getDeliveryRating())
                .deliveryReview(review.getDeliveryReview())
                .deliveryAgentId(review.getDeliveryAgentId())
                .isAnonymous(review.getIsAnonymous())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
