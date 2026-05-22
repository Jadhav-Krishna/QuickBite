package com.quickbite.util;

import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret:mySecretKeyForJWTTokenGenerationAndValidationPurposeOnlyForDevelopment}")
    private String jwtSecret;

    @Value("${app.jwt.expirationMs:3600000}")
    private int jwtExpirationMs;

    @Value("${app.jwt.refreshExpirationMs:86400000}")
    private int jwtRefreshExpirationMs;

    public String generateAccessToken(Authentication authentication) {
        return generateToken(authentication.getName(), jwtExpirationMs);
    }

    public String generateAccessToken(String email) {
        return generateToken(email, jwtExpirationMs);
    }

    public String generateAccessToken(User user) {
        var claims = new HashMap<String, Object>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        return generateTokenWithClaims(user.getEmail(), claims, jwtExpirationMs);
    }

    public String generateRefreshToken(String email) {
        return generateToken(email, jwtRefreshExpirationMs);
    }

    private String generateToken(String subject, int expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    private String generateTokenWithClaims(String subject, HashMap<String, Object> claims, int expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        return Jwts.builder()
                .subject(subject)
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String getEmailFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Failed to get email from token", e);
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public long getTokenExpirationTime() {
        return jwtExpirationMs;
    }

    public String getUserRole(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("role", String.class);
        } catch (JwtException e) {
            log.error("Failed to get role from token", e);
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Object userIdObj = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("userId");
            if (userIdObj instanceof Integer integer) {
                return integer.longValue();
            } else if (userIdObj instanceof Long longValue) {
                return longValue;
            }
            return null;
        } catch (JwtException e) {
            log.error("Failed to get userId from token", e);
            return null;
        }
    }
}