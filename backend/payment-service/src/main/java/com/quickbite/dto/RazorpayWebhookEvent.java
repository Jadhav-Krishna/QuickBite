package com.quickbite.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RazorpayWebhookEvent {

    private String id;
    private String event;

    @JsonProperty("created_at")
    private Long createdAt;

    private PaymentPayload payload;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentPayload {
        private PaymentEntity payment;
        private PaymentEntity refund;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class PaymentEntity {
            private PaymentData entity;

            @Data
            @NoArgsConstructor
            @AllArgsConstructor
            @Builder
            public static class PaymentData {
                private String id;
                private String status;
                private Long amount;
                private String currency;
                private String method;
                private String description;
                private String notes;

                @JsonProperty("created_at")
                private Long createdAt;
            }
        }
    }
}
