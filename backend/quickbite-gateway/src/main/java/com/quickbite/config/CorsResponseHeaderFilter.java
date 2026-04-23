package com.quickbite.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
public class CorsResponseHeaderFilter implements GlobalFilter, Ordered {

    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:5173}")
    private String configuredAllowedOrigins;

    private Set<String> allowedOrigins = Collections.emptySet();

    @PostConstruct
    void initAllowedOrigins() {
        this.allowedOrigins = Stream.of(configuredAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        return chain.filter(exchange).then(Mono.fromRunnable(() -> normalizeCorsOriginHeader(exchange)));
    }

    private void normalizeCorsOriginHeader(ServerWebExchange exchange) {
        String requestOrigin = exchange.getRequest().getHeaders().getOrigin();
        HttpHeaders responseHeaders = exchange.getResponse().getHeaders();

        // Remove any downstream value(s) so the gateway returns only one origin.
        responseHeaders.remove(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN);

        if (requestOrigin != null && allowedOrigins.contains(requestOrigin)) {
            responseHeaders.set(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, requestOrigin);
            responseHeaders.set(HttpHeaders.VARY, HttpHeaders.ORIGIN);
        }
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}