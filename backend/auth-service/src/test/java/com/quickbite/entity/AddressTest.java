package com.quickbite.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AddressTest {

    @Test
    void address_builderWorks() {
        Address address = Address.builder()
                .id(1L)
                .userId(100L)
                .label("Home")
                .addressLine1("Street 1")
                .addressLine2("Apt 2")
                .city("Indore")
                .state("MP")
                .pincode("452001")
                .latitude(22.7196)
                .longitude(75.8577)
                .isDefault(true)
                .build();

        assertEquals(1L, address.getId());
        assertEquals(100L, address.getUserId());
        assertEquals("Home", address.getLabel());
        assertTrue(address.getIsDefault());
    }

    @Test
    void address_prePersist() {
        Address address = Address.builder().build();

        address.onCreate();

        assertNotNull(address.getCreatedAt());
        assertNotNull(address.getUpdatedAt());
    }

    @Test
    void address_preUpdate() {
        Address address = Address.builder().build();

        address.onUpdate();

        assertNotNull(address.getUpdatedAt());
    }
}
