package com.quickbite.entity;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void user_builderWorks() {
        User user = User.builder()
                .id(1L)
                .email("test@mail.com")
                .password("encoded")
                .fullName("Test User")
                .phone("1234567890")
                .role(UserRole.CUSTOMER)
                .isActive(true)
                .isEmailVerified(true)
                .build();

        assertEquals(1L, user.getId());
        assertEquals("test@mail.com", user.getEmail());
        assertEquals("CUSTOMER", user.getRole().name());
    }

    @Test
    void user_getAuthorities() {
        User user = User.builder()
                .role(UserRole.CUSTOMER)
                .build();

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();

        assertEquals(1, authorities.size());
        assertTrue(authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    void user_getUsername() {
        User user = User.builder()
                .email("test@mail.com")
                .build();

        assertEquals("test@mail.com", user.getUsername());
    }

    @Test
    void user_isAccountNonExpired() {
        User user = User.builder().build();

        assertTrue(user.isAccountNonExpired());
    }

    @Test
    void user_isAccountNonLocked() {
        User user = User.builder().isActive(true).build();

        assertTrue(user.isAccountNonLocked());
    }

    @Test
    void user_isAccountLocked() {
        User user = User.builder().isActive(false).build();

        assertFalse(user.isAccountNonLocked());
    }

    @Test
    void user_isCredentialsNonExpired() {
        User user = User.builder().build();

        assertTrue(user.isCredentialsNonExpired());
    }

    @Test
    void user_isEnabled() {
        User user = User.builder()
                .isActive(true)
                .isEmailVerified(true)
                .build();

        assertTrue(user.isEnabled());
    }

    @Test
    void user_isNotEnabled() {
        User user = User.builder()
                .isActive(true)
                .isEmailVerified(false)
                .build();

        assertFalse(user.isEnabled());
    }

    @Test
    void user_prePersist() {
        User user = User.builder().build();

        user.onCreate();

        assertNotNull(user.getCreatedAt());
        assertNotNull(user.getUpdatedAt());
    }

    @Test
    void user_preUpdate() {
        User user = User.builder().build();

        user.onUpdate();

        assertNotNull(user.getUpdatedAt());
    }
}
