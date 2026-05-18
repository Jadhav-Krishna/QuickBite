package com.quickbite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickbite.dto.*;
import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.event.AuthEvent;
import com.quickbite.exception.AuthenticationException;
import com.quickbite.exception.InvalidCredentialsException;
import com.quickbite.exception.UserAlreadyExistsException;
import com.quickbite.repository.UserRepository;
import com.quickbite.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@Slf4j
public class AuthService {

    private static final String BEARER = "Bearer";
    private static final String USER_NOT_FOUND = "User not found";
    private static final String EMAIL_KEY = "email";
    private static final String ERROR_KEY = "error";
    private static final String ERROR_DESCRIPTION_KEY = "error_description";
    private static final String ACCESS_TOKEN_KEY = "access_token";
    private static final String USER_NOT_FOUND_WITH_ID = "User not found with id: ";
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=";
    private static final String GITHUB_USER_API = "https://api.github.com/user";
    private static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    private static final String NOTIFICATION_ROUTING_KEY_LOGIN = "notification.login";
    private static final String NOTIFICATION_ROUTING_KEY_SIGNUP = "notification.signup";
    private static final String USER_SESSION_PREFIX = "user:session:";
    private static final String USER_PROFILE_PREFIX = "user:profile:";
    private static final long SESSION_TTL = 3600;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${oauth2.google.clientId:}")
    private String googleClientId;

    @Value("${oauth2.google.clientSecret:}")
    private String googleClientSecret;

    @Value("${oauth2.github.clientId:}")
    private String githubClientId;

    @Value("${oauth2.github.clientSecret:}")
    private String githubClientSecret;

    @Value("${oauth2.redirect-base-url:http://localhost:8000}")
    private String oauthRedirectBaseUrl;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    // ==================== Registration & Login ====================

    public AuthResponse signup(SignupRequest request) {
        UserRole requestedRole = UserRole.valueOf(request.getRole().toUpperCase());

        if (requestedRole == UserRole.ADMIN || requestedRole == UserRole.APPLICATION_ADMIN) {
            throw new InvalidCredentialsException("Admin accounts cannot be created through public signup");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistsException("Phone number already registered");
        }

        boolean requiresManualApproval = requestedRole == UserRole.DELIVERY_AGENT;

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(requestedRole)
                .isActive(!requiresManualApproval)
                .isEmailVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        publishSignupNotification(savedUser);

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser);
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getEmail());

        return AuthResponse.builder()
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getTokenExpirationTime())
                .tokenType(BEARER)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (user.getOauthProvider() != null && !user.getOauthProvider().isEmpty()) {
            throw new AuthenticationException("This account uses " + user.getOauthProvider() + " login. Please use OAuth to sign in.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new AuthenticationException("User account is deactivated");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        publishLoginNotification(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        AuthResponse response = AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getTokenExpirationTime())
                .tokenType(BEARER)
                .build();

        cacheUserSession(user.getId(), accessToken);
        cacheUserProfile(user);

        return response;
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AuthenticationException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getTokenExpirationTime())
                .tokenType(BEARER)
                .build();
    }

    public User validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthenticationException("Invalid token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));
    }

    // ==================== OAuth2 ====================

    public AuthResponse loginWithOAuth2(OAuth2LoginRequest request) {
        try {
            if ("GOOGLE".equalsIgnoreCase(request.getProvider())) {
                return handleGoogleOAuth(request);
            } else if ("GITHUB".equalsIgnoreCase(request.getProvider())) {
                return handleGitHubOAuth(request);
            } else {
                throw new InvalidCredentialsException("Unsupported OAuth2 provider: " + request.getProvider());
            }
        } catch (Exception e) {
            log.error("OAuth2 login failed for provider: {}", request.getProvider(), e);
            throw new AuthenticationException("OAuth2 authentication failed: " + e.getMessage());
        }
    }

    private AuthResponse handleGoogleOAuth(OAuth2LoginRequest request) {
        try {
            String accessToken = request.getToken();
            
            if (!accessToken.contains(".")) {
                log.info("Exchanging Google authorization code for access token");
                accessToken = exchangeGoogleCode(accessToken, resolveRedirectUri(request, "google"));
            }

            log.info("Validating Google access token");
            String response = restTemplate.getForObject(GOOGLE_TOKEN_INFO_URL + accessToken, String.class);
            JsonNode node = objectMapper.readTree(response);

            if (!node.has(EMAIL_KEY)) {
                throw new AuthenticationException("Email not found in Google token response");
            }

            String email = node.get(EMAIL_KEY).asText();
            String name = extractNodeText(node, "name", email.split("@")[0]);
            String googleId = extractNodeText(node, "sub", node.has("user_id") ? node.get("user_id").asText() : null);

            log.info("Google OAuth successful for email: {}", email);

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createOAuthUser(email, name, "GOOGLE", googleId));

            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
            publishLoginNotification(user);

            AuthResponse authResponse = buildAuthResponse(user);
            cacheUserSession(user.getId(), authResponse.getAccessToken());
            cacheUserProfile(user);

            return authResponse;
        } catch (Exception e) {
            log.error("Google OAuth validation failed", e);
            throw new AuthenticationException("Google OAuth validation failed: " + e.getMessage());
        }
    }

    private AuthResponse handleGitHubOAuth(OAuth2LoginRequest request) {
        try {
            String accessToken = request.getToken();
            if (!accessToken.contains(".")) {
                accessToken = exchangeGitHubCode(accessToken, resolveRedirectUri(request, "github"));
            }

            var headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            var entity = new org.springframework.http.HttpEntity<>(headers);

            String response = restTemplate.exchange(GITHUB_USER_API, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
            JsonNode node = objectMapper.readTree(response);

            String email = resolveGitHubEmail(node, entity);
            if (email == null || email.isEmpty()) {
                throw new AuthenticationException("Unable to retrieve email from GitHub");
            }

            String name = extractNodeText(node, "name", email.split("@")[0]);
            final String githubId = node.get("id").asText();

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createOAuthUser(email, name, "GITHUB", githubId));

            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
            publishLoginNotification(user);

            AuthResponse authResponse = buildAuthResponse(user);
            cacheUserSession(user.getId(), authResponse.getAccessToken());
            cacheUserProfile(user);

            return authResponse;
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("GitHub OAuth error", e);
            throw new AuthenticationException("GitHub OAuth validation failed: " + e.getMessage());
        }
    }

    private String resolveGitHubEmail(JsonNode userNode, org.springframework.http.HttpEntity<?> entity) {
        String email = extractNodeText(userNode, EMAIL_KEY, null);
        if (email != null && !email.isEmpty()) {
            return email;
        }

        try {
            String emailsResponse = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
            ).getBody();
            JsonNode emailsNode = objectMapper.readTree(emailsResponse);

            if (emailsNode == null || !emailsNode.isArray() || emailsNode.isEmpty()) {
                return null;
            }

            return findPrimaryEmail(emailsNode);
        } catch (Exception e) {
            log.error("Failed to resolve GitHub email from /user/emails endpoint", e);
            throw new AuthenticationException("Failed to retrieve email from GitHub: " + e.getMessage());
        }
    }

    private String findPrimaryEmail(JsonNode emailsNode) {
        for (JsonNode emailNode : emailsNode) {
            if (emailNode.get("primary").asBoolean()) {
                return emailNode.get(EMAIL_KEY).asText();
            }
        }
        return emailsNode.get(0).get(EMAIL_KEY).asText();
    }

    private String extractNodeText(JsonNode node, String field, String defaultValue) {
        if (node.has(field) && !node.get(field).isNull()) {
            return node.get(field).asText();
        }
        return defaultValue;
    }

    private String exchangeGitHubCode(String code, String redirectUri) {
        try {
            log.info("Exchanging GitHub authorization code");
            String tokenUrl = "https://github.com/login/oauth/access_token";
            
            if (githubClientId == null || githubClientId.isEmpty()) {
                throw new AuthenticationException("GitHub OAuth not configured. Missing client ID.");
            }
            
            if (githubClientSecret == null || githubClientSecret.isEmpty()) {
                throw new AuthenticationException("GitHub OAuth not configured. Missing client secret.");
            }
            
            Map<String, String> params = new HashMap<>();
            params.put("client_id", githubClientId);
            params.put("client_secret", githubClientSecret);
            params.put("code", code);
            params.put("redirect_uri", redirectUri);

            var headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            var entity = new org.springframework.http.HttpEntity<>(params, headers);
            String response = restTemplate.postForObject(tokenUrl, entity, String.class);
            JsonNode node = objectMapper.readTree(response);

            if (node.has(ERROR_KEY)) {
                String error = node.get(ERROR_KEY).asText();
                String errorDesc = node.has(ERROR_DESCRIPTION_KEY) ? node.get(ERROR_DESCRIPTION_KEY).asText() : "Unknown error";
                throw new AuthenticationException("GitHub token exchange error: " + error + " - " + errorDesc);
            }

            if (node.has(ACCESS_TOKEN_KEY)) {
                log.info("Successfully exchanged GitHub code for access token");
                return node.get(ACCESS_TOKEN_KEY).asText();
            }

            throw new AuthenticationException("Failed to exchange GitHub code for token - no access_token in response");
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("GitHub token exchange failed", e);
            throw new AuthenticationException("GitHub token exchange failed: " + e.getMessage());
        }
    }

    private String exchangeGoogleCode(String code, String redirectUri) {
        try {
            log.info("Exchanging Google authorization code");
            String tokenUrl = "https://oauth2.googleapis.com/token";
            
            if (googleClientId == null || googleClientId.isEmpty()) {
                throw new AuthenticationException("Google OAuth not configured. Missing client ID.");
            }
            
            if (googleClientSecret == null || googleClientSecret.isEmpty()) {
                throw new AuthenticationException("Google OAuth not configured. Missing client secret.");
            }
            
            org.springframework.util.MultiValueMap<String, String> params = new org.springframework.util.LinkedMultiValueMap<>();
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("code", code);
            params.add("grant_type", "authorization_code");
            params.add("redirect_uri", redirectUri);

            var headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

            var entity = new org.springframework.http.HttpEntity<>(params, headers);
            String response = restTemplate.postForObject(tokenUrl, entity, String.class);
            JsonNode node = objectMapper.readTree(response);

            if (node.has(ERROR_KEY)) {
                String error = node.get(ERROR_KEY).asText();
                String errorDesc = node.has(ERROR_DESCRIPTION_KEY) ? node.get(ERROR_DESCRIPTION_KEY).asText() : "Unknown error";
                throw new AuthenticationException("Google token exchange error: " + error + " - " + errorDesc);
            }

            if (node.has(ACCESS_TOKEN_KEY)) {
                log.info("Successfully exchanged Google code for access token");
                return node.get(ACCESS_TOKEN_KEY).asText();
            }

            throw new AuthenticationException("Failed to exchange Google code for token - no access_token in response");
        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token exchange failed", e);
            throw new AuthenticationException("Google token exchange failed: " + e.getMessage());
        }
    }

    private String resolveRedirectUri(OAuth2LoginRequest request, String provider) {
        if (request.getRedirectUri() != null && !request.getRedirectUri().isBlank()) {
            return request.getRedirectUri();
        }

        String baseUrl = oauthRedirectBaseUrl.endsWith("/")
                ? oauthRedirectBaseUrl.substring(0, oauthRedirectBaseUrl.length() - 1)
                : oauthRedirectBaseUrl;
        return baseUrl + "/api/auth/oauth2/callback/" + provider;
    }

    private User createOAuthUser(String email, String name, String provider, String providerId) {
        UserRole role = UserRole.CUSTOMER;

        User user = User.builder()
                .email(email)
                .fullName(name)
                .oauthProvider(provider)
                .oauthId(providerId)
                .isActive(true)
                .isEmailVerified(true)
                .role(role)
                .password(passwordEncoder.encode(""))
                .phone(null)
                .lastLogin(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    // ==================== Profile Management ====================

    @Transactional(readOnly = true)
    public UserDTO getUserProfile(String email) {
        UserDTO cachedProfile = getCachedUserProfile(email);
        if (cachedProfile != null) {
            return cachedProfile;
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));
        UserDTO userDTO = mapToUserDTO(user);
        
        cacheUserProfileByEmail(email, userDTO);
        return userDTO;
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        UserDTO cachedProfile = getCachedUserProfileById(userId);
        if (cachedProfile != null) {
            return cachedProfile;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND_WITH_ID + userId));
        UserDTO userDTO = mapToUserDTO(user);
        
        cacheUserProfile(user);
        return userDTO;
    }

    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            final Long currentUserId = user.getId();
            userRepository.findByPhone(request.getPhone()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(currentUserId)) {
                    throw new UserAlreadyExistsException("Phone number already in use");
                }
            });
            user.setPhone(request.getPhone());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        User savedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", email);
        
        cacheUserProfile(savedUser);
        
        return mapToUserDTO(savedUser);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));

        if (user.getOauthProvider() != null && !user.getOauthProvider().isEmpty()) {
            throw new InvalidCredentialsException("Cannot change password for OAuth accounts");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("New password and confirmation do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", email);
    }

    public void deactivateAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("Account deactivated for user: {}", email);
    }

    // ==================== Forgot / Reset Password ====================

    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getOauthProvider() != null && !user.getOauthProvider().isEmpty()) {
                return; // silently skip OAuth accounts
            }
            String token = java.util.UUID.randomUUID().toString();
            if (redisTemplate != null) {
                redisTemplate.opsForValue().set(
                        "pwd:reset:" + token, email,
                        java.time.Duration.ofMinutes(30));
            }
            String resetLink = frontendBaseUrl + "/forgot-password?token=" + token;
            publishPasswordResetNotification(user, resetLink);
            log.info("Password reset link generated for: {}", email);
        });
        // Always return success to avoid email enumeration
    }

    public void resetPassword(String token, String newPassword) {
        if (redisTemplate == null) {
            throw new AuthenticationException("Password reset service unavailable");
        }
        String key = "pwd:reset:" + token;
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached == null) {
            throw new InvalidCredentialsException("Reset link is invalid or has expired");
        }
        String email = cached.toString();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        redisTemplate.delete(key);
        log.info("Password reset successfully for: {}", email);
    }

    private void publishPasswordResetNotification(User user, String resetLink) {
        if (rabbitTemplate == null) return;
        try {
            AuthEvent event = AuthEvent.builder()
                    .eventType("PASSWORD_RESET")
                    .userId(user.getId())
                    .title("Password Reset Request")
                    .message("Click the link to reset your password: " + resetLink)
                    .notificationType("EMAIL")
                    .recipientEmail(user.getEmail())
                    .recipientRole(user.getRole().name())
                    .createdAt(LocalDateTime.now().toString())
                    .build();
            rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, "notification.password_reset", event);
        } catch (Exception e) {
            log.warn("Failed to publish password reset notification: {}", e.getMessage());
        }
    }

    // ==================== Admin Operations ====================

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(String role) {
        UserRole userRole = UserRole.valueOf(role.toUpperCase());
        return userRepository.findByRole(userRole).stream()
                .map(this::mapToUserDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDTO)
                .toList();
    }

    public void suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND_WITH_ID + userId));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User suspended: {}", userId);
    }

    public void reactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException(USER_NOT_FOUND_WITH_ID + userId));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User reactivated: {}", userId);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AuthenticationException(USER_NOT_FOUND_WITH_ID + userId);
        }
        userRepository.deleteById(userId);
        log.info("User deleted: {}", userId);
    }

    // ==================== Helper Methods ====================

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getTokenExpirationTime())
                .tokenType(BEARER)
                .build();
    }

    private UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .profilePictureUrl(user.getProfilePictureUrl())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .oauthProvider(user.getOauthProvider())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .build();
    }

    private void publishLoginNotification(User user) {
        if (rabbitTemplate == null || user == null) {
            return;
        }

        try {
            AuthEvent event = AuthEvent.builder()
                    .eventType("USER_LOGIN")
                    .userId(user.getId())
                    .title("Login Successful")
                    .message("Welcome back, " + user.getFullName() + ". You are signed in.")
                    .notificationType("IN_APP")
                    .recipientEmail(user.getEmail())
                    .recipientRole(user.getRole().name())
                    .createdAt(LocalDateTime.now().toString())
                    .build();

            rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY_LOGIN, event);
            log.info("Published login notification for user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish login notification for {}: {}", user.getEmail(), e.getMessage());
        }
    }

    private void publishSignupNotification(User user) {
        if (rabbitTemplate == null || user == null) {
            return;
        }

        try {
            AuthEvent event = AuthEvent.builder()
                    .eventType("USER_SIGNUP")
                    .userId(user.getId())
                    .title("Welcome to QuickBite!")
                    .message("Welcome " + user.getFullName() + "! Your account has been created successfully. Start exploring delicious food near you.")
                    .notificationType("IN_APP")
                    .recipientEmail(user.getEmail())
                    .recipientRole(user.getRole().name())
                    .createdAt(LocalDateTime.now().toString())
                    .build();

            rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY_SIGNUP, event);
            log.info("Published signup notification for user: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to publish signup notification for {}: {}", user.getEmail(), e.getMessage());
        }
    }

    // ==================== Redis Cache Methods ====================

    private void cacheUserSession(Long userId, String token) {
        if (redisTemplate == null) return;
        try {
            String key = USER_SESSION_PREFIX + userId;
            redisTemplate.opsForValue().set(key, token, java.time.Duration.ofSeconds(SESSION_TTL));
            log.debug("User session cached for userId: {}", userId);
        } catch (Exception e) {
            log.warn("Failed to cache user session: {}", e.getMessage());
        }
    }

    private void cacheUserProfile(User user) {
        if (redisTemplate == null) return;
        try {
            String key = USER_PROFILE_PREFIX + user.getId();
            UserDTO userDTO = mapToUserDTO(user);
            redisTemplate.opsForValue().set(key, userDTO, java.time.Duration.ofSeconds(SESSION_TTL));
            log.debug("User profile cached for userId: {}", user.getId());
        } catch (Exception e) {
            log.warn("Failed to cache user profile: {}", e.getMessage());
        }
    }

    private void cacheUserProfileByEmail(String email, UserDTO userDTO) {
        if (redisTemplate == null) return;
        try {
            String key = USER_PROFILE_PREFIX + "email:" + email;
            redisTemplate.opsForValue().set(key, userDTO, java.time.Duration.ofSeconds(SESSION_TTL));
            log.debug("User profile cached for email: {}", email);
        } catch (Exception e) {
            log.warn("Failed to cache user profile by email: {}", e.getMessage());
        }
    }

    private UserDTO getCachedUserProfile(String email) {
        if (redisTemplate == null) return null;
        try {
            String key = USER_PROFILE_PREFIX + "email:" + email;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached instanceof UserDTO userdto) {
                log.debug("User profile retrieved from cache for email: {}", email);
                return userdto;
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve cached user profile: {}", e.getMessage());
        }
        return null;
    }

    private UserDTO getCachedUserProfileById(Long userId) {
        if (redisTemplate == null) return null;
        try {
            String key = USER_PROFILE_PREFIX + userId;
            Object cached = redisTemplate.opsForValue().get(key);
            if (cached instanceof UserDTO userdto) {
                log.debug("User profile retrieved from cache for userId: {}", userId);
                return userdto;
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve cached user profile: {}", e.getMessage());
        }
        return null;
    }
}
