package com.quickbite.service;

import com.quickbite.dto.*;
import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.exception.AuthenticationException;
import com.quickbite.exception.InvalidCredentialsException;
import com.quickbite.exception.UserAlreadyExistsException;
import com.quickbite.repository.UserRepository;
import com.quickbite.util.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private RestTemplate restTemplate;
    @Mock private RabbitTemplate rabbitTemplate;
    @Mock private RedisTemplate<String, Object> redisTemplate;

    @InjectMocks private AuthService authService;

    private User user;
    private LoginRequest loginRequest;
    private SignupRequest signupRequest;

    @BeforeEach
    void setup() {
        user = User.builder()
                .id(1L)
                .email("test@mail.com")
                .password("encoded")
                .fullName("Krishna")
                .phone("9999999999")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .build();

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@mail.com");
        loginRequest.setPassword("123");

        signupRequest = new SignupRequest();
        signupRequest.setEmail("test@mail.com");
        signupRequest.setPassword("123");
        signupRequest.setFullName("Krishna");
        signupRequest.setPhone("9999999999");
        signupRequest.setRole("CUSTOMER");
    }

    // ================= SIGNUP =================

    @Test
    void signup_success() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);

        AuthResponse res = authService.signup(signupRequest);

        assertNotNull(res);
        assertEquals("test@mail.com", res.getEmail());
    }

    @Test
    void signup_adminNotAllowed() {
        signupRequest.setRole("ADMIN");
        assertThrows(InvalidCredentialsException.class,
                () -> authService.signup(signupRequest));
    }

    // ================= LOGIN =================

    @Test
    void login_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);

        AuthResponse res = authService.login(loginRequest);

        assertNotNull(res);
        verify(userRepository).save(any());
    }

    @Test
    void login_wrongPassword() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(AuthenticationException.class,
                () -> authService.login(loginRequest));
    }

    // ================= REFRESH TOKEN =================

    @Test
    void refreshToken_success() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken(any())).thenReturn("test@mail.com");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("newAccess");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);

        AuthResponse res = authService.refreshToken("valid");

        assertEquals("newAccess", res.getAccessToken());
    }

    @Test
    void refreshToken_invalid() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        assertThrows(AuthenticationException.class,
                () -> authService.refreshToken("bad"));
    }

    // ================= CHANGE PASSWORD =================

    @Test
    void changePassword_success() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("old");
        req.setNewPassword("new");
        req.setConfirmPassword("new");

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "encoded")).thenReturn(true);
        when(passwordEncoder.encode(any())).thenReturn("newEncoded");

        authService.changePassword("test@mail.com", req);

        verify(userRepository).save(any());
    }

    @Test
    void changePassword_wrongCurrent() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("wrong");
        req.setNewPassword("new");
        req.setConfirmPassword("new");

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(InvalidCredentialsException.class,
                () -> authService.changePassword("test@mail.com", req));
    }

    // ================= PROFILE =================

    @Test
    void updateProfile_success() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("New Name");

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        UserDTO dto = authService.updateProfile("test@mail.com", req);

        assertNotNull(dto);
    }

    // ================= ADMIN =================

    @Test
    void suspendUser_success() {
        when(userRepository.findById(any())).thenReturn(Optional.of(user));

        authService.suspendUser(1L);

        verify(userRepository).save(argThat(u -> !u.getIsActive()));
    }

    @Test
    void deleteUser_notFound() {
        when(userRepository.existsById(any())).thenReturn(false);

        assertThrows(AuthenticationException.class,
                () -> authService.deleteUser(1L));
    }

    // ================= VALIDATE TOKEN =================

    @Test
    void validateToken_success() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken(any())).thenReturn("test@mail.com");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));

        User u = authService.validateToken("token");

        assertEquals("test@mail.com", u.getEmail());
    }
}