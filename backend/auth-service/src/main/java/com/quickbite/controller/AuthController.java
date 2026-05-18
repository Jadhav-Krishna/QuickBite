package com.quickbite.controller;

import com.quickbite.dto.*;
import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private static final String LOCATION_HEADER = "Location";
    private static final String MESSAGE_KEY = "message";

    @Autowired
    private AuthService authService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${oauth2.redirect-base-url:}")
    private String oauthRedirectBaseUrl;

    // ==================== Registration & Login ====================

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        log.info("Signup request for email: {}", request.getEmail());
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        log.info("Refresh token request");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth2/login")
    public ResponseEntity<AuthResponse> loginWithOAuth2(@Valid @RequestBody OAuth2LoginRequest request) {
        log.info("OAuth2 login request from provider: {}", request.getProvider());
        AuthResponse response = authService.loginWithOAuth2(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth2/callback/google")
    public ResponseEntity<String> googleCallback(@RequestParam("code") String code, HttpServletRequest servletRequest) {
        log.info("Google OAuth callback received with code");
        try {
            OAuth2LoginRequest request = new OAuth2LoginRequest();
            request.setProvider("GOOGLE");
            request.setToken(code);
            request.setRedirectUri(buildCallbackUri(servletRequest));
            AuthResponse response = authService.loginWithOAuth2(request);

            String redirectUrl = buildFrontendCallbackUrl(response);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(LOCATION_HEADER, redirectUrl)
                    .build();
        } catch (Exception e) {
            log.error("Google OAuth failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(LOCATION_HEADER, buildFrontendErrorUrl(e.getMessage()))
                    .build();
        }
    }

    @GetMapping("/oauth2/callback/github")
    public ResponseEntity<String> githubCallback(@RequestParam("code") String code, HttpServletRequest servletRequest) {
        log.info("GitHub OAuth callback received with code");
        try {
            OAuth2LoginRequest request = new OAuth2LoginRequest();
            request.setProvider("GITHUB");
            request.setToken(code);
            request.setRedirectUri(buildCallbackUri(servletRequest));
            AuthResponse response = authService.loginWithOAuth2(request);

            String redirectUrl = buildFrontendCallbackUrl(response);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(LOCATION_HEADER, redirectUrl)
                    .build();
        } catch (Exception e) {
            log.error("GitHub OAuth failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(LOCATION_HEADER, buildFrontendErrorUrl(e.getMessage()))
                    .build();
        }
    }

    private String buildCallbackUri(HttpServletRequest request) {
        if (oauthRedirectBaseUrl != null && !oauthRedirectBaseUrl.isBlank()) {
            String baseUrl = oauthRedirectBaseUrl.endsWith("/")
                    ? oauthRedirectBaseUrl.substring(0, oauthRedirectBaseUrl.length() - 1)
                    : oauthRedirectBaseUrl;
            return baseUrl + request.getRequestURI();
        }

        String forwardedProto = request.getHeader("X-Forwarded-Proto");
        String forwardedHost = request.getHeader("X-Forwarded-Host");
        String proto = forwardedProto != null && !forwardedProto.isBlank() ? forwardedProto : request.getScheme();
        String host = forwardedHost != null && !forwardedHost.isBlank() ? forwardedHost : request.getHeader("Host");

        return UriComponentsBuilder.fromUriString(proto + "://" + host)
                .path(request.getRequestURI())
                .build()
                .toUriString();
    }

    private String buildFrontendCallbackUrl(AuthResponse response) {
        return UriComponentsBuilder.fromHttpUrl(frontendBaseUrl)
                .path("/auth/callback")
                .queryParam("token", response.getAccessToken())
                .queryParam("refreshToken", response.getRefreshToken())
                .queryParam("userId", response.getUserId())
                .queryParam("email", response.getEmail())
                .queryParam("role", response.getRole())
                .queryParam("fullName", response.getFullName())
                .build()
                .encode()
                .toUriString();
    }

    private String buildFrontendErrorUrl(String message) {
        return UriComponentsBuilder.fromHttpUrl(frontendBaseUrl)
                .path("/login")
                .queryParam("error", message)
                .build()
                .encode()
                .toUriString();
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        authService.validateToken(token);
        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        // JWT is stateless — client simply discards the token.
        // In a production system, you'd add the token to a blacklist (Redis).
        log.info("Logout request received");
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== Profile Management ====================

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(@RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        UserDTO profile = authService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateProfileRequest request) {
        String email = extractEmailFromToken(authHeader);
        log.info("Profile update request for: {}", email);
        UserDTO updatedProfile = authService.updateProfile(email, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ChangePasswordRequest request) {
        String email = extractEmailFromToken(authHeader);
        log.info("Password change request for: {}", email);
        authService.changePassword(email, request);
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "Password changed successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/deactivate")
    public ResponseEntity<Map<String, String>> deactivateAccount(
            @RequestHeader("Authorization") String authHeader) {
        String email = extractEmailFromToken(authHeader);
        log.info("Account deactivation request for: {}", email);
        authService.deactivateAccount(email);
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "Account deactivated successfully");
        return ResponseEntity.ok(response);
    }

    // ==================== User Lookup (inter-service) ====================

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable("userId") Long userId) {
        UserDTO user = authService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable("role") String role) {
        List<UserDTO> users = authService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    // ==================== Admin Operations ====================

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        requireAdmin(authHeader);
        List<UserDTO> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<Map<String, String>> suspendUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("userId") Long userId) {
        requireAdmin(authHeader);
        log.info("Suspend user request for userId: {}", userId);
        authService.suspendUser(userId);
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "User suspended successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/reactivate")
    public ResponseEntity<Map<String, String>> reactivateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("userId") Long userId) {
        requireAdmin(authHeader);
        log.info("Reactivate user request for userId: {}", userId);
        authService.reactivateUser(userId);
        Map<String, String> response = new HashMap<>();
        response.put(MESSAGE_KEY, "User reactivated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("userId") Long userId) {
        requireAdmin(authHeader);
        log.info("Delete user request for userId: {}", userId);
        authService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Helper ====================

    private void requireAdmin(String authHeader) {
        User user = authService.validateToken(extractToken(authHeader));
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.APPLICATION_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    private String extractEmailFromToken(String authHeader) {
        String token = extractToken(authHeader);
        return authService.validateToken(token).getEmail();
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authHeader.substring(7);
    }
}
