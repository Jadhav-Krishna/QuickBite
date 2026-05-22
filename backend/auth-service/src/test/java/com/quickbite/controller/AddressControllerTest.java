package com.quickbite.controller;

import com.quickbite.dto.AddressDTO;
import com.quickbite.dto.CreateAddressRequest;
import com.quickbite.dto.UpdateAddressRequest;
import com.quickbite.service.AddressService;
import com.quickbite.service.GeocodingService;
import com.quickbite.util.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AddressControllerTest {

    @Mock
    private AddressService addressService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private GeocodingService geocodingService;

    @InjectMocks
    private AddressController addressController;

    private AddressDTO addressDTO;

    @BeforeEach
    void setup() {
        addressDTO = AddressDTO.builder()
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

    @Test
    void getAllAddresses_success() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(any())).thenReturn(100L);
        when(addressService.getAllAddresses(any())).thenReturn(List.of(addressDTO));

        ResponseEntity<List<AddressDTO>> response = addressController.getAllAddresses("Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAllAddresses_unauthorized() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        ResponseEntity<List<AddressDTO>> response = addressController.getAllAddresses("Bearer token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void getAllAddresses_noHeader() {
        ResponseEntity<List<AddressDTO>> response = addressController.getAllAddresses(null);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void getAddressById_success() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(any())).thenReturn(100L);
        when(addressService.getAddressById(any(), any())).thenReturn(addressDTO);

        ResponseEntity<AddressDTO> response = addressController.getAddressById(1L, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getAddressById_unauthorized() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        ResponseEntity<AddressDTO> response = addressController.getAddressById(1L, "Bearer token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void createAddress_success() {
        CreateAddressRequest request = new CreateAddressRequest();
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(any())).thenReturn(100L);
        when(addressService.createAddress(any(), any())).thenReturn(addressDTO);

        ResponseEntity<AddressDTO> response = addressController.createAddress(request, "Bearer token");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @Test
    void createAddress_unauthorized() {
        CreateAddressRequest request = new CreateAddressRequest();
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        ResponseEntity<AddressDTO> response = addressController.createAddress(request, "Bearer token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void updateAddress_success() {
        UpdateAddressRequest request = new UpdateAddressRequest();
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(any())).thenReturn(100L);
        when(addressService.updateAddress(any(), any(), any())).thenReturn(addressDTO);

        ResponseEntity<AddressDTO> response = addressController.updateAddress(1L, request, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void updateAddress_unauthorized() {
        UpdateAddressRequest request = new UpdateAddressRequest();
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        ResponseEntity<AddressDTO> response = addressController.updateAddress(1L, request, "Bearer token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void deleteAddress_success() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(any())).thenReturn(100L);

        ResponseEntity<Void> response = addressController.deleteAddress(1L, "Bearer token");

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void deleteAddress_unauthorized() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        ResponseEntity<Void> response = addressController.deleteAddress(1L, "Bearer token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void setDefaultAddress_success() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromToken(any())).thenReturn(100L);
        when(addressService.setDefaultAddress(any(), any())).thenReturn(addressDTO);

        ResponseEntity<AddressDTO> response = addressController.setDefaultAddress(1L, "Bearer token");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void setDefaultAddress_unauthorized() {
        when(jwtTokenProvider.validateToken(any())).thenReturn(false);

        ResponseEntity<AddressDTO> response = addressController.setDefaultAddress(1L, "Bearer token");

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void geocodeAddress_success() {
        Map<String, Double> coords = Map.of("latitude", 22.7196, "longitude", 75.8577);
        when(geocodingService.geocodeAddress(any())).thenReturn(coords);

        ResponseEntity<Map<String, Double>> response = addressController.geocodeAddress("Indore");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void geocodeAddress_notFound() {
        when(geocodingService.geocodeAddress(any())).thenReturn(null);

        ResponseEntity<Map<String, Double>> response = addressController.geocodeAddress("Unknown");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void reverseGeocodeAddress_success() {
        Map<String, String> address = Map.of("city", "Indore", "state", "MP");
        when(geocodingService.reverseGeocode(anyDouble(), anyDouble())).thenReturn(address);

        ResponseEntity<Map<String, String>> response = addressController.reverseGeocodeAddress(22.7196, 75.8577);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void reverseGeocodeAddress_notFound() {
        when(geocodingService.reverseGeocode(anyDouble(), anyDouble())).thenReturn(null);

        ResponseEntity<Map<String, String>> response = addressController.reverseGeocodeAddress(0.0, 0.0);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
}
