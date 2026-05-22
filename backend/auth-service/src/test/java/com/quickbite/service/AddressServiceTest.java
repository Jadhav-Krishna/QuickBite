package com.quickbite.service;

import com.quickbite.dto.*;
import com.quickbite.entity.Address;
import com.quickbite.repository.AddressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock
    private AddressRepository addressRepository;

    @InjectMocks
    private AddressService addressService;

    private Address address;

    @BeforeEach
    void setup() {
        address = Address.builder()
                .id(1L)
                .userId(100L)
                .label("Home")
                .addressLine1("Street 1")
                .city("Indore")
                .state("MP")
                .pincode("452001")
                .isDefault(true)
                .build();
    }

    // ================= GET =================

    @Test
    void getAllAddresses_success() {
        when(addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(any()))
                .thenReturn(List.of(address));

        List<AddressDTO> result = addressService.getAllAddresses(100L);

        assertEquals(1, result.size());
    }

    @Test
    void getAddressById_success() {
        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.of(address));

        AddressDTO dto = addressService.getAddressById(1L, 100L);

        assertEquals("Home", dto.getLabel());
    }

    @Test
    void getAddressById_notFound() {
        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> addressService.getAddressById(1L, 100L));
    }

    // ================= CREATE =================

    @Test
    void createAddress_success() {
        CreateAddressRequest req = new CreateAddressRequest();
        req.setLabel("Office");
        req.setIsDefault(true);

        when(addressRepository.findByUserIdAndIsDefaultTrue(any()))
                .thenReturn(Optional.of(address));
        when(addressRepository.save(any())).thenReturn(address);

        AddressDTO dto = addressService.createAddress(req, 100L);

        assertNotNull(dto);
        verify(addressRepository, atLeastOnce()).save(any());
    }

    // ================= UPDATE =================

    @Test
    void updateAddress_success() {
        UpdateAddressRequest req = new UpdateAddressRequest();
        req.setCity("Bhopal");

        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.of(address));
        when(addressRepository.save(any())).thenReturn(address);

        AddressDTO dto = addressService.updateAddress(1L, req, 100L);

        assertEquals("Bhopal", address.getCity());
    }

    @Test
    void updateAddress_setDefault() {
        UpdateAddressRequest req = new UpdateAddressRequest();
        req.setIsDefault(true);

        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.of(address));
        when(addressRepository.findByUserIdAndIsDefaultTrue(any()))
                .thenReturn(Optional.of(address));
        when(addressRepository.save(any())).thenReturn(address);

        AddressDTO dto = addressService.updateAddress(1L, req, 100L);

        assertTrue(dto.getIsDefault());
    }

    // ================= DELETE =================

    @Test
    void deleteAddress_success() {
        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.of(address));

        addressService.deleteAddress(1L, 100L);

        verify(addressRepository).delete(any());
    }

    @Test
    void deleteAddress_notFound() {
        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> addressService.deleteAddress(1L, 100L));
    }

    // ================= DEFAULT =================

    @Test
    void setDefaultAddress_success() {
        when(addressRepository.findByIdAndUserId(any(), any()))
                .thenReturn(Optional.of(address));
        when(addressRepository.findByUserIdAndIsDefaultTrue(any()))
                .thenReturn(Optional.of(address));
        when(addressRepository.save(any())).thenReturn(address);

        AddressDTO dto = addressService.setDefaultAddress(1L, 100L);

        assertTrue(dto.getIsDefault());
    }
}