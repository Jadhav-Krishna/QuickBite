package com.quickbite.config;

import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import com.quickbite.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Slf4j
public class AdminBootstrapConfig {

    @Bean
    CommandLineRunner ensureApplicationAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.enabled:true}") boolean enabled,
            @Value("${app.bootstrap.admin.email:neha.admin@quickbite.in}") String email,
            @Value("${app.bootstrap.admin.password:Admin@12345}") String password,
            @Value("${app.bootstrap.admin.full-name:QuickBite Admin}") String fullName,
            @Value("${app.bootstrap.admin.phone:+919822334455}") String phone) {
        return args -> {
            if (!enabled) {
                return;
            }

            userRepository.findByEmail(email)
                    .ifPresentOrElse(existingUser -> {
                        boolean changed = false;

                        if (existingUser.getRole() != UserRole.APPLICATION_ADMIN) {
                            existingUser.setRole(UserRole.APPLICATION_ADMIN);
                            changed = true;
                        }

                        if (!Boolean.TRUE.equals(existingUser.getIsActive())) {
                            existingUser.setIsActive(true);
                            changed = true;
                        }

                        if (!Boolean.TRUE.equals(existingUser.getIsEmailVerified())) {
                            existingUser.setIsEmailVerified(true);
                            changed = true;
                        }

                        if (changed) {
                            userRepository.save(existingUser);
                            log.info("Updated existing application admin account: {}", email);
                        }
                    }, () -> {
                        User adminUser = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode(password))
                                .fullName(fullName)
                                .phone(phone)
                                .role(UserRole.APPLICATION_ADMIN)
                                .isActive(true)
                                .isEmailVerified(true)
                                .build();

                        userRepository.save(adminUser);
                        log.info("Created bootstrap application admin account: {}", email);
                    });
        };
    }
}
