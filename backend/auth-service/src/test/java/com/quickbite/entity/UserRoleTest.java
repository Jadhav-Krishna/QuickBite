package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserRoleTest {

    @Test
    void userRole_getCode() {
        assertEquals("CUSTOMER", UserRole.CUSTOMER.getCode());
        assertEquals("ADMIN", UserRole.ADMIN.getCode());
        assertEquals("DELIVERY_AGENT", UserRole.DELIVERY_AGENT.getCode());
    }

    @Test
    void userRole_getDescription() {
        assertNotNull(UserRole.CUSTOMER.getDescription());
        assertNotNull(UserRole.ADMIN.getDescription());
    }

    @Test
    void userRole_fromCode_success() {
        UserRole role = UserRole.fromCode("CUSTOMER");

        assertEquals(UserRole.CUSTOMER, role);
    }

    @Test
    void userRole_fromCode_invalid() {
        assertThrows(IllegalArgumentException.class, () -> UserRole.fromCode("INVALID"));
    }

    @Test
    void userRole_allValues() {
        UserRole[] roles = UserRole.values();

        assertEquals(6, roles.length);
        assertTrue(java.util.Arrays.asList(roles).contains(UserRole.GUEST));
        assertTrue(java.util.Arrays.asList(roles).contains(UserRole.CUSTOMER));
        assertTrue(java.util.Arrays.asList(roles).contains(UserRole.RESTAURANT_OWNER));
        assertTrue(java.util.Arrays.asList(roles).contains(UserRole.DELIVERY_AGENT));
        assertTrue(java.util.Arrays.asList(roles).contains(UserRole.ADMIN));
        assertTrue(java.util.Arrays.asList(roles).contains(UserRole.APPLICATION_ADMIN));
    }
}
