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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
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

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${github.client.id:}")
    private String githubClientId;

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final String GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=";
    private static final String GITHUB_USER_API = "https://api.github.com/user";

    // ==================== Registration & Login ====================

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new UserAlreadyExistsException("Phone number already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.valueOf(request.getRole()))
                .isActive(true)
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

            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new AuthenticationException("Google OAuth validation failed: " + e.getMessage());
        }
    }

    private AuthResponse handleGitHubOAuth(OAuth2LoginRequest request) {
        try {
            var headers = new org.springframework.http.HttpHeaders();
            headers.setBearerAuth(request.getToken());
            var entity = new org.springframework.http.HttpEntity<>(headers);

            String response = restTemplate.exchange(GITHUB_USER_API, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
            JsonNode node = objectMapper.readTree(response);

            String email = node.get("email").asText();
            String name = node.get("name").asText();
            String githubId = node.get("id").asText();

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createOAuthUser(email, name, "GITHUB", githubId));

            user.setLastLogin(LocalDateTime.now());
            user = userRepository.save(user);

            return buildAuthResponse(user);
        } catch (Exception e) {
            throw new AuthenticationException("GitHub OAuth validation failed: " + e.getMessage());
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
            userRepository.findByPhone(request.getPhone()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(user.getId())) {
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
}
