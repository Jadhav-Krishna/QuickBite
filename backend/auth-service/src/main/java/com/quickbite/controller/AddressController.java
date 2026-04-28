package com.quickbite.controller;

import com.quickbite.dto.AddressDTO;
import com.quickbite.dto.CreateAddressRequest;
import com.quickbite.dto.UpdateAddressRequest;
import com.quickbite.service.AddressService;
import com.quickbite.service.GeocodingService;
import com.quickbite.util.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@Slf4j
public class AddressController {
    private final AddressService addressService;
    private final JwtTokenProvider jwtTokenProvider;
    private final GeocodingService geocodingService;

    public AddressController(AddressService addressService, JwtTokenProvider jwtTokenProvider, GeocodingService geocodingService) {
        this.addressService = addressService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.geocodingService = geocodingService;
    }

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.error("No valid authorization token provided");
            throw new RuntimeException("No valid authorization token");
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            log.error("Invalid token provided");
            throw new RuntimeException("Invalid token");
        }
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAllAddresses(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            log.info("Getting all addresses for user");
            Long userId = getUserIdFromToken(authHeader);
            log.info("User ID from token: {}", userId);
            List<AddressDTO> addresses = addressService.getAllAddresses(userId);
            log.info("Found {} addresses", addresses.size());
            return ResponseEntity.ok(addresses);
        } catch (Exception e) {
            log.error("Error getting addresses: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.ok(addressService.getAddressById(id, userId));
        } catch (Exception e) {
            log.error("Error getting address: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(
            @Valid @RequestBody CreateAddressRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(addressService.createAddress(request, userId));
        } catch (Exception e) {
            log.error("Error creating address: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @PathVariable Long id,
            @RequestBody UpdateAddressRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.ok(addressService.updateAddress(id, request, userId));
        } catch (Exception e) {
            log.error("Error updating address: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            addressService.deleteAddress(id, userId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting address: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressDTO> setDefaultAddress(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.ok(addressService.setDefaultAddress(id, userId));
        } catch (Exception e) {
            log.error("Error setting default address: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/geocode")
    public ResponseEntity<Map<String, Double>> geocodeAddress(@RequestParam("address") String address) {
        Map<String, Double> coordinates = geocodingService.geocodeAddress(address);
        if (coordinates != null) {
            return ResponseEntity.ok(coordinates);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/reverse-geocode")
    public ResponseEntity<Map<String, String>> reverseGeocodeAddress(
            @RequestParam("latitude") double latitude,
            @RequestParam("longitude") double longitude) {
        Map<String, String> address = geocodingService.reverseGeocode(latitude, longitude);
        if (address != null) {
            return ResponseEntity.ok(address);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
