package com.quickbite.controller;

import com.quickbite.dto.*;
import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private AuthResponse authResponse;
    private User user;
    private UserDTO userDTO;

    @BeforeEach
    void setup() {
        authResponse = AuthResponse.builder()
                .userId(1L)
                .email("test@mail.com")
                .fullName("Test User")
                .role("CUSTOMER")
                .accessToken("access")
                .refreshToken("refresh")
                .expiresIn(3600L)
                .tokenType("Bearer")
                .build();

        user = User.builder()
                .id(1L)
                .email("test@mail.com")
                .fullName("Test User")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();

        userDTO = UserDTO.builder()
                .userId(1L)
                .email("test@mail.com")
                .fullName("Test User")
                .role("CUSTOMER")
                .build();
    }

    @Test
    void signup_success() {
        SignupRequest request = new SignupRequest();
        when(authService.signup(any())).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.signup(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest();
        when(authService.login(any())).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void refreshToken_success() {
        Map<String, String> request = Map.of("refreshToken", "refresh");
        when(authService.refreshToken(any())).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.refreshToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void loginWithOAuth2_success() {
        OAuth2LoginRequest request = new OAuth2LoginRequest();
        when(authService.loginWithOAuth2(any())).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.loginWithOAuth2(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void validateToken_success() {
        when(authService.validateToken(any())).thenReturn(user);

        ResponseEntity<Map<String, Object>> response = authController.validateToken("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("valid"));
    }

    @Test
    void validateToken_noHeader() {
        ResponseEntity<Map<String, Object>> response = authController.validateToken(null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void validateToken_invalidHeader() {
        ResponseEntity<Map<String, Object>> response = authController.validateToken("InvalidHeader");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void logout_success() {
        ResponseEntity<Map<String, String>> response = authController.logout("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Logged out successfully", response.getBody().get("message"));
    }

    @Test
    void getProfile_success() {
        when(authService.validateToken(any())).thenReturn(user);
        when(authService.getUserProfile(any())).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = authController.getProfile("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void updateProfile_success() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        when(authService.validateToken(any())).thenReturn(user);
        when(authService.updateProfile(any(), any())).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = authController.updateProfile("Bearer token", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void changePassword_success() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        when(authService.validateToken(any())).thenReturn(user);

        ResponseEntity<Map<String, String>> response = authController.changePassword("Bearer token", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Password changed successfully", response.getBody().get("message"));
    }

    @Test
    void deactivateAccount_success() {
        when(authService.validateToken(any())).thenReturn(user);

        ResponseEntity<Map<String, String>> response = authController.deactivateAccount("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Account deactivated successfully", response.getBody().get("message"));
    }

    @Test
    void getUserById_success() {
        when(authService.getUserById(any())).thenReturn(userDTO);

        ResponseEntity<UserDTO> response = authController.getUserById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getUsersByRole_success() {
        when(authService.getUsersByRole(any())).thenReturn(List.of(userDTO));

        ResponseEntity<List<UserDTO>> response = authController.getUsersByRole("CUSTOMER");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAllUsers_success() {
        User admin = User.builder().id(1L).email("admin@mail.com").role(UserRole.ADMIN).build();
        when(authService.validateToken(any())).thenReturn(admin);
        when(authService.getAllUsers()).thenReturn(List.of(userDTO));

        ResponseEntity<List<UserDTO>> response = authController.getAllUsers("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getAllUsers_forbidden() {
        when(authService.validateToken(any())).thenReturn(user);

        assertThrows(ResponseStatusException.class, () -> authController.getAllUsers("Bearer token"));
    }

    @Test
    void suspendUser_success() {
        User admin = User.builder().id(1L).email("admin@mail.com").role(UserRole.ADMIN).build();
        when(authService.validateToken(any())).thenReturn(admin);

        ResponseEntity<Map<String, String>> response = authController.suspendUser("Bearer token", 2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User suspended successfully", response.getBody().get("message"));
    }

    @Test
    void reactivateUser_success() {
        User admin = User.builder().id(1L).email("admin@mail.com").role(UserRole.APPLICATION_ADMIN).build();
        when(authService.validateToken(any())).thenReturn(admin);

        ResponseEntity<Map<String, String>> response = authController.reactivateUser("Bearer token", 2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User reactivated successfully", response.getBody().get("message"));
    }

    @Test
    void deleteUser_success() {
        User admin = User.builder().id(1L).email("admin@mail.com").role(UserRole.ADMIN).build();
        when(authService.validateToken(any())).thenReturn(admin);

        ResponseEntity<Void> response = authController.deleteUser("Bearer token", 2L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void extractToken_missingHeader() {
        assertThrows(ResponseStatusException.class, () -> authController.getProfile(null));
    }

    @Test
    void extractToken_invalidFormat() {
        assertThrows(ResponseStatusException.class, () -> authController.getProfile("InvalidToken"));
    }
}
