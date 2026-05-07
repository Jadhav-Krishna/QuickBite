package com.quickbite.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            @Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource
    ) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // CSRF protection is disabled because:
                // 1. This is a stateless REST API using JWT tokens (no session cookies)
                // 2. JWT tokens are sent in Authorization headers, not cookies
                // 3. SessionCreationPolicy is STATELESS - no server-side sessions
                // 4. CSRF attacks target cookie-based authentication, which we don't use
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/signup",
                                "/api/auth/login",
                                "/api/auth/refresh-token",
                                "/api/auth/oauth2/login",
                                "/api/auth/oauth2/callback/**",
                                "/api/auth/validate",
                                "/actuator/**"
                        ).permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
