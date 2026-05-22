package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Long orderId;
    private Long customerId;
    private Long restaurantId;
    private Integer restaurantRating;
    private String restaurantReview;
    private Integer deliveryRating;
    private String deliveryReview;
    private Long deliveryAgentId;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;
}
