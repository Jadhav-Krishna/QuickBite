package com.quickbite.config;

import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapConfigTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private final AdminBootstrapConfig config = new AdminBootstrapConfig();

    @Test
    void ensureApplicationAdmin_createsNewAdmin() throws Exception {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("encoded");

        CommandLineRunner runner = config.ensureApplicationAdmin(
                userRepository, passwordEncoder, true,
                "admin@test.com", "password", "Admin", "+1234567890"
        );

        runner.run();

        verify(userRepository).save(any(User.class));
    }

    @Test
    void ensureApplicationAdmin_updatesExistingUser() throws Exception {
        User existingUser = User.builder()
                .id(1L)
                .email("admin@test.com")
                .role(UserRole.CUSTOMER)
                .isActive(false)
                .isEmailVerified(false)
                .build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(existingUser));

        CommandLineRunner runner = config.ensureApplicationAdmin(
                userRepository, passwordEncoder, true,
                "admin@test.com", "password", "Admin", "+1234567890"
        );

        runner.run();

        verify(userRepository).save(argThat(user ->
                user.getRole() == UserRole.APPLICATION_ADMIN &&
                        user.getIsActive() &&
                        user.getIsEmailVerified()
        ));
    }

    @Test
    void ensureApplicationAdmin_noChangeNeeded() throws Exception {
        User existingUser = User.builder()
                .id(1L)
                .email("admin@test.com")
                .role(UserRole.APPLICATION_ADMIN)
                .isActive(true)
                .isEmailVerified(true)
                .build();

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(existingUser));

        CommandLineRunner runner = config.ensureApplicationAdmin(
                userRepository, passwordEncoder, true,
                "admin@test.com", "password", "Admin", "+1234567890"
        );

        runner.run();

        verify(userRepository, never()).save(any());
    }

    @Test
    void ensureApplicationAdmin_disabled() throws Exception {
        CommandLineRunner runner = config.ensureApplicationAdmin(
                userRepository, passwordEncoder, false,
                "admin@test.com", "password", "Admin", "+1234567890"
        );

        runner.run();

        verify(userRepository, never()).findByEmail(any());
        verify(userRepository, never()).save(any());
    }
}
