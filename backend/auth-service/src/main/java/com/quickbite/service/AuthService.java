package com.quickbite.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickbite.dto.*;
import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.exception.AuthenticationException;
import com.quickbite.exception.InvalidCredentialsException;
import com.quickbite.exception.UserAlreadyExistsException;
import com.quickbite.repository.UserRepository;
import com.quickbite.util.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
public class AuthService {

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

    @Value("${oauth2.google.clientId:}")
    private String googleClientId;

    @Value("${oauth2.github.clientId:}")
    private String githubClientId;

    @Value("${oauth2.github.clientSecret:}")
    private String githubClientSecret;

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=";
    private static final String GITHUB_USER_API = "https://api.github.com/user";
    private static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    private static final String NOTIFICATION_ROUTING_KEY = "notification.login";

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
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthenticationException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new AuthenticationException("User account is deactivated");
        }

        // Update last login timestamp
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        publishLoginNotification(user);

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
                .tokenType("Bearer")
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AuthenticationException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getTokenExpirationTime())
                .tokenType("Bearer")
                .build();
    }

    public User validateToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new AuthenticationException("Invalid token");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));
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
            String response = restTemplate.getForObject(GOOGLE_TOKEN_INFO_URL + request.getToken(), String.class);
            JsonNode node = objectMapper.readTree(response);

            String email = node.get("email").asText();
            String name = node.get("name") != null ? node.get("name").asText() : email.split("@")[0];

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createOAuthUser(email, name, "GOOGLE", node.get("sub").asText()));

            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
            publishLoginNotification(user);

            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new AuthenticationException("Google OAuth validation failed: " + e.getMessage());
        }
    }

    private AuthResponse handleGitHubOAuth(OAuth2LoginRequest request) {
        try {
            // If token looks like a code (no dots), exchange it for access token
            String accessToken = request.getToken();
            if (!accessToken.contains(".")) {
                accessToken = exchangeGitHubCode(accessToken);
            }

            var headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(accessToken);
            var entity = new org.springframework.http.HttpEntity<>(headers);

            String response = restTemplate.exchange(GITHUB_USER_API, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
            JsonNode node = objectMapper.readTree(response);

            String email = node.has("email") && !node.get("email").isNull() ? node.get("email").asText() : null;
            
            // If email is null, fetch from emails endpoint
            if (email == null || email.isEmpty()) {
                String emailsResponse = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    String.class
                ).getBody();
                JsonNode emailsNode = objectMapper.readTree(emailsResponse);
                if (emailsNode.isArray() && emailsNode.size() > 0) {
                    for (JsonNode emailNode : emailsNode) {
                        if (emailNode.get("primary").asBoolean()) {
                            email = emailNode.get("email").asText();
                            break;
                        }
                    }
                    if (email == null) {
                        email = emailsNode.get(0).get("email").asText();
                    }
                }
            }

            if (email == null || email.isEmpty()) {
                throw new AuthenticationException("Unable to retrieve email from GitHub");
            }

            String name = node.has("name") && !node.get("name").isNull() ? node.get("name").asText() : email.split("@")[0];
            final String finalEmail = email;
            final String finalName = name;
            final String githubId = node.get("id").asText();

            User user = userRepository.findByEmail(finalEmail)
                    .orElseGet(() -> createOAuthUser(finalEmail, finalName, "GITHUB", githubId));

            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);
            publishLoginNotification(user);

            return buildAuthResponse(user);
        } catch (Exception e) {
            log.error("GitHub OAuth error", e);
            throw new AuthenticationException("GitHub OAuth validation failed: " + e.getMessage());
        }
    }

    private String exchangeGitHubCode(String code) {
        try {
            String tokenUrl = "https://github.com/login/oauth/access_token";
            Map<String, String> params = new HashMap<>();
            params.put("client_id", githubClientId);
            params.put("client_secret", githubClientSecret);
            params.put("code", code);

            var headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            var entity = new org.springframework.http.HttpEntity<>(params, headers);
            String response = restTemplate.postForObject(tokenUrl, entity, String.class);
            JsonNode node = objectMapper.readTree(response);

            if (node.has("access_token")) {
                return node.get("access_token").asText();
            }

            throw new AuthenticationException("Failed to exchange GitHub code for token");
        } catch (Exception e) {
            log.error("GitHub token exchange failed", e);
            throw new AuthenticationException("GitHub token exchange failed: " + e.getMessage());
        }
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
                .password("")
                .phone("")
                .lastLogin(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    // ==================== Profile Management ====================

    @Transactional(readOnly = true)
    public UserDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));
        return mapToUserDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found with id: " + userId));
        return mapToUserDTO(user);
    }

    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            // Check if phone is already used by another user
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
        return mapToUserDTO(savedUser);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Validate new password matches confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidCredentialsException("New password and confirmation do not match");
        }

        // Ensure new password is different from current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", email);
    }

    public void deactivateAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found"));

        user.setIsActive(false);
        userRepository.save(user);
        log.info("Account deactivated for user: {}", email);
    }

    // ==================== Admin Operations ====================

    @Transactional(readOnly = true)
    public List<UserDTO> getUsersByRole(String role) {
        UserRole userRole = UserRole.valueOf(role.toUpperCase());
        return userRepository.findByRole(userRole).stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDTO)
                .collect(Collectors.toList());
    }

    public void suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found with id: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User suspended: {}", userId);
    }

    public void reactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthenticationException("User not found with id: " + userId));
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User reactivated: {}", userId);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new AuthenticationException("User not found with id: " + userId);
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
                .tokenType("Bearer")
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
            Map<String, Object> payload = new HashMap<>();
            payload.put("eventType", "USER_LOGIN");
            payload.put("userId", user.getId());
            payload.put("title", "Login Successful");
            payload.put("message", "Welcome back, " + user.getFullName() + ". You are signed in.");
            payload.put("notificationType", "IN_APP");
            payload.put("recipientEmail", user.getEmail());
            payload.put("recipientRole", user.getRole().name());
            payload.put("createdAt", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend(NOTIFICATION_EXCHANGE, NOTIFICATION_ROUTING_KEY, payload);
        } catch (Exception e) {
            log.warn("Failed to publish login notification for {}: {}", user.getEmail(), e.getMessage());
        }
    }
}
