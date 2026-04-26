package com.quickbite.controller;

import com.quickbite.dto.ReviewDTO;
import com.quickbite.service.ReviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@Slf4j
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(@RequestBody ReviewDTO request) {
        ReviewDTO created = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ReviewDTO> getReviewByOrder(@PathVariable("orderId") Long orderId) {
        return ResponseEntity.ok(reviewService.getReviewByOrderId(orderId));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewDTO>> getRestaurantReviews(@PathVariable("restaurantId") Long restaurantId) {
        return ResponseEntity.ok(reviewService.getRestaurantReviews(restaurantId));
    }

    @GetMapping("/restaurant/{restaurantId}/rating")
    public ResponseEntity<Double> getRestaurantRating(@PathVariable("restaurantId") Long restaurantId) {
        return ResponseEntity.ok(reviewService.getRestaurantAverageRating(restaurantId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReviewDTO>> getCustomerReviews(@PathVariable("customerId") Long customerId) {
        return ResponseEntity.ok(reviewService.getCustomerReviews(customerId));
    }

    @GetMapping("/delivery/{agentId}")
    public ResponseEntity<List<ReviewDTO>> getDeliveryAgentReviews(@PathVariable("agentId") Long agentId) {
        return ResponseEntity.ok(reviewService.getDeliveryAgentReviews(agentId));
    }

    @GetMapping("/delivery/{agentId}/rating")
    public ResponseEntity<Double> getDeliveryAgentRating(@PathVariable("agentId") Long agentId) {
        return ResponseEntity.ok(reviewService.getDeliveryAgentAverageRating(agentId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReviewDTO>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }
}
