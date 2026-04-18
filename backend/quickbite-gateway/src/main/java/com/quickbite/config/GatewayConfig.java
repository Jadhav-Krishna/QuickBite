package com.quickbite.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://AUTH-SERVICE"))

                .route("restaurant-service", r -> r
                        .path("/api/v1/restaurants/**")
                        .uri("lb://RESTAURANT-SERVICE"))

                .route("menu-service", r -> r
                        .path("/api/v1/menu/**")
                        .uri("lb://MENU-SERVICE"))

                .route("cart-service", r -> r
                        .path("/api/v1/cart/**")
                        .uri("lb://CART-SERVICE"))

                .route("order-service", r -> r
                        .path("/api/v1/orders/**")
                        .uri("lb://ORDER-SERVICE"))

                .route("payment-service", r -> r
                        .path("/api/payments/**")
                        .uri("lb://PAYMENT-SERVICE"))

                .route("delivery-service", r -> r
                        .path("/api/v1/delivery/**")
                        .uri("lb://DELIVERY-SERVICE"))

                .route("review-service", r -> r
                        .path("/api/v1/reviews/**")
                        .uri("lb://REVIEW-SERVICE"))

                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**", "/ws/**")
                        .uri("lb://NOTIFICATION-SERVICE"))

                .build();
    }
}