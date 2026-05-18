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
                        .path("/api/auth/**", "/api/v1/auth/**", "/api/addresses/**")
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
                        .path("/api/v1/payments/**")
                        .uri("lb://PAYMENT-SERVICE"))

                .route("delivery-service", r -> r
                        .path("/api/v1/delivery/**")
                        .uri("lb://DELIVERY-SERVICE"))

                .route("review-service", r -> r
                        .path("/api/v1/reviews/**")
                        .uri("lb://REVIEW-SERVICE"))

                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**")
                        .uri("lb://NOTIFICATION-SERVICE"))

                .route("admin-server", r -> r
                        .path("/api/admin/**")
                        .uri("http://admin-server:8762"))

                .route("delivery-websocket", r -> r
                        .path("/ws/tracking/**")
                        .uri("lb:ws://DELIVERY-SERVICE"))

                // Swagger API Docs Routes
                .route("auth-service-docs", r -> r
                        .path("/v3/api-docs/auth-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/auth-service", "/v3/api-docs"))
                        .uri("lb://AUTH-SERVICE"))
                .route("restaurant-service-docs", r -> r
                        .path("/v3/api-docs/restaurant-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/restaurant-service", "/v3/api-docs"))
                        .uri("lb://RESTAURANT-SERVICE"))
                .route("menu-service-docs", r -> r
                        .path("/v3/api-docs/menu-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/menu-service", "/v3/api-docs"))
                        .uri("lb://MENU-SERVICE"))
                .route("cart-service-docs", r -> r
                        .path("/v3/api-docs/cart-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/cart-service", "/v3/api-docs"))
                        .uri("lb://CART-SERVICE"))
                .route("order-service-docs", r -> r
                        .path("/v3/api-docs/order-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/order-service", "/v3/api-docs"))
                        .uri("lb://ORDER-SERVICE"))
                .route("payment-service-docs", r -> r
                        .path("/v3/api-docs/payment-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/payment-service", "/v3/api-docs"))
                        .uri("lb://PAYMENT-SERVICE"))
                .route("delivery-service-docs", r -> r
                        .path("/v3/api-docs/delivery-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/delivery-service", "/v3/api-docs"))
                        .uri("lb://DELIVERY-SERVICE"))
                .route("review-service-docs", r -> r
                        .path("/v3/api-docs/review-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/review-service", "/v3/api-docs"))
                        .uri("lb://REVIEW-SERVICE"))
                .route("notification-service-docs", r -> r
                        .path("/v3/api-docs/notification-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/notification-service", "/v3/api-docs"))
                        .uri("lb://NOTIFICATION-SERVICE"))

                .build();
    }
}
