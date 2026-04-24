package com.quickbite.controller;

import com.quickbite.dto.AddressDTO;
import com.quickbite.dto.CreateAddressRequest;
import com.quickbite.dto.UpdateAddressRequest;
import com.quickbite.service.AddressService;
import com.quickbite.util.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {
    private final AddressService addressService;
    private final JwtTokenProvider jwtTokenProvider;

    public AddressController(AddressService addressService, JwtTokenProvider jwtTokenProvider) {
        this.addressService = addressService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("No valid authorization token");
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid token");
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        return jwtTokenProvider.getUserIdFromToken(token);
    }

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAllAddresses(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.ok(addressService.getAllAddresses(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.ok(addressService.getAddressById(id, userId));
        } catch (Exception e) {
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressDTO> setDefaultAddress(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            Long userId = getUserIdFromToken(authHeader);
            return ResponseEntity.ok(addressService.setDefaultAddress(id, userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
