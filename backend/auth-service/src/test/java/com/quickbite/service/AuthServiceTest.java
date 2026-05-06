package com.quickbite.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
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

    @Test
    void validateToken_invalid() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);
        assertThrows(AuthenticationException.class, () -> authService.validateToken("bad"));
    }

    @Test
    void validateToken_userNotFound() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken(any())).thenReturn("test@mail.com");
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.validateToken("token"));
    }

    @Test
    void signup_emailExists() {
        when(userRepository.existsByEmail(any())).thenReturn(true);
        assertThrows(UserAlreadyExistsException.class, () -> authService.signup(signupRequest));
    }

    @Test
    void signup_phoneExists() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(true);
        assertThrows(UserAlreadyExistsException.class, () -> authService.signup(signupRequest));
    }

    @Test
    void signup_deliveryAgent() {
        signupRequest.setRole("DELIVERY_AGENT");
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);

        AuthResponse res = authService.signup(signupRequest);
        assertNotNull(res);
    }

    @Test
    void signup_applicationAdminNotAllowed() {
        signupRequest.setRole("APPLICATION_ADMIN");
        assertThrows(InvalidCredentialsException.class, () -> authService.signup(signupRequest));
    }

    @Test
    void login_userNotFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_oauthUser() {
        user.setOauthProvider("GOOGLE");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        assertThrows(AuthenticationException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_inactiveUser() {
        user.setIsActive(false);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        assertThrows(AuthenticationException.class, () -> authService.login(loginRequest));
    }

    @Test
    void refreshToken_userNotFound() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getEmailFromToken(any())).thenReturn("test@mail.com");
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.refreshToken("token"));
    }

    @Test
    void getUserProfile_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        UserDTO dto = authService.getUserProfile("test@mail.com");
        assertNotNull(dto);
        assertEquals("test@mail.com", dto.getEmail());
    }

    @Test
    void getUserProfile_notFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.getUserProfile("test@mail.com"));
    }

    @Test
    void getUserById_success() {
        when(userRepository.findById(any())).thenReturn(Optional.of(user));
        UserDTO dto = authService.getUserById(1L);
        assertNotNull(dto);
        assertEquals(1L, dto.getUserId());
    }

    @Test
    void getUserById_notFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.getUserById(1L));
    }

    @Test
    void updateProfile_phoneAlreadyExists() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setPhone("8888888888");
        User otherUser = User.builder().id(2L).phone("8888888888").build();
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.findByPhone(any())).thenReturn(Optional.of(otherUser));
        assertThrows(UserAlreadyExistsException.class, () -> authService.updateProfile("test@mail.com", req));
    }

    @Test
    void updateProfile_allFields() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("New Name");
        req.setPhone("8888888888");
        req.setProfilePictureUrl("http://pic.com/img.jpg");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.findByPhone(any())).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenReturn(user);
        UserDTO dto = authService.updateProfile("test@mail.com", req);
        assertNotNull(dto);
    }

    @Test
    void changePassword_userNotFound() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.changePassword("test@mail.com", req));
    }

    @Test
    void changePassword_oauthUser() {
        user.setOauthProvider("GOOGLE");
        ChangePasswordRequest req = new ChangePasswordRequest();
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        assertThrows(InvalidCredentialsException.class, () -> authService.changePassword("test@mail.com", req));
    }

    @Test
    void changePassword_mismatch() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("old");
        req.setNewPassword("new1");
        req.setConfirmPassword("new2");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        assertThrows(InvalidCredentialsException.class, () -> authService.changePassword("test@mail.com", req));
    }

    @Test
    void changePassword_sameAsOld() {
        ChangePasswordRequest req = new ChangePasswordRequest();
        req.setCurrentPassword("old");
        req.setNewPassword("old");
        req.setConfirmPassword("old");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("old", "encoded")).thenReturn(true);
        when(passwordEncoder.matches("old", "encoded")).thenReturn(true);
        assertThrows(InvalidCredentialsException.class, () -> authService.changePassword("test@mail.com", req));
    }

    @Test
    void deactivateAccount_success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        authService.deactivateAccount("test@mail.com");
        verify(userRepository).save(argThat(u -> !u.getIsActive()));
    }

    @Test
    void deactivateAccount_notFound() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.deactivateAccount("test@mail.com"));
    }

    @Test
    void getUsersByRole_success() {
        when(userRepository.findByRole(any())).thenReturn(List.of(user));
        List<UserDTO> users = authService.getUsersByRole("CUSTOMER");
        assertEquals(1, users.size());
    }

    @Test
    void getAllUsers_success() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        List<UserDTO> users = authService.getAllUsers();
        assertEquals(1, users.size());
    }

    @Test
    void suspendUser_notFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.suspendUser(1L));
    }

    @Test
    void reactivateUser_success() {
        when(userRepository.findById(any())).thenReturn(Optional.of(user));
        authService.reactivateUser(1L);
        verify(userRepository).save(argThat(u -> u.getIsActive()));
    }

    @Test
    void reactivateUser_notFound() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.reactivateUser(1L));
    }

    @Test
    void deleteUser_success() {
        when(userRepository.existsById(any())).thenReturn(true);
        authService.deleteUser(1L);
        verify(userRepository).deleteById(1L);
    }

    @Test
    void loginWithOAuth2_google_success() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("ya29.access_token");
        String jsonResponse = "{\"email\":\"test@gmail.com\",\"name\":\"Test User\",\"sub\":\"123456\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_google_newUser() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("ya29.access_token");
        String jsonResponse = "{\"email\":\"new@gmail.com\",\"name\":\"New User\",\"sub\":\"123456\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_google_codeExchange() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "googleClientId", "client_id");
        ReflectionTestUtils.setField(authService, "googleClientSecret", "client_secret");
        String tokenResponse = "{\"access_token\":\"ya29.token\"}";
        String userResponse = "{\"email\":\"test@gmail.com\",\"name\":\"Test\",\"sub\":\"123\"}";
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(tokenResponse);
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(userResponse);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }



    @Test
    void loginWithOAuth2_unsupportedProvider() {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("FACEBOOK");
        req.setToken("token");
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    @Test
    void loginWithOAuth2_google_noEmail() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("ya29.token");
        String jsonResponse = "{\"name\":\"Test\"}";
        when(restTemplate.getForObject(anyString(), eq(String.class))).thenReturn(jsonResponse);
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    // ================= GITHUB OAUTH =================

    @Test
    void loginWithOAuth2_github_existingUser() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("gho_token.xxx");
        String userJson = "{\"email\":\"test@mail.com\",\"name\":\"Git User\",\"id\":\"456\"}";
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(userJson, HttpStatus.OK));
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_github_newUser() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("gho_token.xxx");
        String userJson = "{\"email\":\"new@github.com\",\"name\":\"New Git\",\"id\":\"789\"}";
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(userJson, HttpStatus.OK));
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_github_emailFromEmailsEndpoint() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("gho_token.xxx");
        String userJson = "{\"name\":\"Git User\",\"id\":\"456\"}";
        String emailsJson = "[{\"email\":\"primary@github.com\",\"primary\":true},{\"email\":\"other@github.com\",\"primary\":false}]";
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(userJson, HttpStatus.OK))
                .thenReturn(new ResponseEntity<>(emailsJson, HttpStatus.OK));
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_github_fallbackFirstEmail() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("gho_token.xxx");
        String userJson = "{\"name\":\"Git User\",\"id\":\"456\"}";
        String emailsJson = "[{\"email\":\"fallback@github.com\",\"primary\":false}]";
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(userJson, HttpStatus.OK))
                .thenReturn(new ResponseEntity<>(emailsJson, HttpStatus.OK));
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_github_noEmailAnywhere() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("gho_token.xxx");
        String userJson = "{\"name\":\"Git User\",\"id\":\"456\"}";
        String emailsJson = "[]";
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(userJson, HttpStatus.OK))
                .thenReturn(new ResponseEntity<>(emailsJson, HttpStatus.OK));
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    @Test
    void loginWithOAuth2_github_codeExchange() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "githubClientId", "client_id");
        ReflectionTestUtils.setField(authService, "githubClientSecret", "client_secret");
        String tokenResponse = "{\"access_token\":\"gho_token\"}";
        String userJson = "{\"email\":\"test@github.com\",\"name\":\"Git User\",\"id\":\"456\"}";
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(tokenResponse);
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(String.class)))
                .thenReturn(new ResponseEntity<>(userJson, HttpStatus.OK));
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("refresh");
        when(jwtTokenProvider.getTokenExpirationTime()).thenReturn(1000L);
        AuthResponse res = authService.loginWithOAuth2(req);
        assertNotNull(res);
    }

    @Test
    void loginWithOAuth2_github_codeExchangeMissingClientId() {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "githubClientId", "");
        ReflectionTestUtils.setField(authService, "githubClientSecret", "secret");
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    @Test
    void loginWithOAuth2_github_codeExchangeMissingClientSecret() {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "githubClientId", "client_id");
        ReflectionTestUtils.setField(authService, "githubClientSecret", "");
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    @Test
    void loginWithOAuth2_github_codeExchangeError() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GITHUB");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "githubClientId", "client_id");
        ReflectionTestUtils.setField(authService, "githubClientSecret", "client_secret");
        String tokenResponse = "{\"error\":\"bad_code\",\"error_description\":\"The code is invalid\"}";
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(tokenResponse);
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    // ================= GOOGLE CODE EXCHANGE ERRORS =================

    @Test
    void loginWithOAuth2_google_codeExchangeMissingClientId() {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "googleClientId", "");
        ReflectionTestUtils.setField(authService, "googleClientSecret", "secret");
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    @Test
    void loginWithOAuth2_google_codeExchangeMissingClientSecret() {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "googleClientId", "client_id");
        ReflectionTestUtils.setField(authService, "googleClientSecret", "");
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    @Test
    void loginWithOAuth2_google_codeExchangeError() throws Exception {
        OAuth2LoginRequest req = new OAuth2LoginRequest();
        req.setProvider("GOOGLE");
        req.setToken("auth_code");
        ReflectionTestUtils.setField(authService, "googleClientId", "client_id");
        ReflectionTestUtils.setField(authService, "googleClientSecret", "client_secret");
        String tokenResponse = "{\"error\":\"invalid_grant\",\"error_description\":\"Code expired\"}";
        when(restTemplate.postForObject(anyString(), any(), eq(String.class))).thenReturn(tokenResponse);
        assertThrows(AuthenticationException.class, () -> authService.loginWithOAuth2(req));
    }

    // ================= REDIS CACHE PATHS =================

    @Test
    void getUserProfile_fromCache() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, Object> valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        UserDTO cachedDto = UserDTO.builder().userId(1L).email("test@mail.com").build();
        when(valueOps.get(anyString())).thenReturn(cachedDto);
        UserDTO result = authService.getUserProfile("test@mail.com");
        assertEquals("test@mail.com", result.getEmail());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void getUserById_fromCache() {
        @SuppressWarnings("unchecked")
        ValueOperations<String, Object> valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        UserDTO cachedDto = UserDTO.builder().userId(1L).email("test@mail.com").build();
        when(valueOps.get(anyString())).thenReturn(cachedDto);
        UserDTO result = authService.getUserById(1L);
        assertEquals(1L, result.getUserId());
        verify(userRepository, never()).findById(any());
    }

    // ================= PROFILE UPDATE EDGE CASES =================

    @Test
    void updateProfile_phoneOwnedBySameUser() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setPhone("9999999999");
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(userRepository.findByPhone(any())).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        UserDTO dto = authService.updateProfile("test@mail.com", req);
        assertNotNull(dto);
    }

    @Test
    void updateProfile_notFound() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        assertThrows(AuthenticationException.class, () -> authService.updateProfile("test@mail.com", req));
    }

}