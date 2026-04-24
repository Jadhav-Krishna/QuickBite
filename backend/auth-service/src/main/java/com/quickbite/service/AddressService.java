package com.quickbite.service;

import com.quickbite.dto.AddressDTO;
import com.quickbite.dto.CreateAddressRequest;
import com.quickbite.dto.UpdateAddressRequest;
import com.quickbite.entity.Address;
import com.quickbite.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AddressService {
    private final AddressRepository addressRepository;

    public List<AddressDTO> getAllAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AddressDTO getAddressById(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        return toDTO(address);
    }

    @Transactional
    public AddressDTO createAddress(CreateAddressRequest request, Long userId) {
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefaultAddress(userId);
        }

        Address address = Address.builder()
                .userId(userId)
                .label(request.getLabel())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();

        return toDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressDTO updateAddress(Long id, UpdateAddressRequest request, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (request.getLabel() != null) address.setLabel(request.getLabel());
        if (request.getAddressLine1() != null) address.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) address.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getPincode() != null) address.setPincode(request.getPincode());
        if (request.getLatitude() != null) address.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) address.setLongitude(request.getLongitude());
        
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            unsetDefaultAddress(userId);
            address.setIsDefault(true);
        }

        return toDTO(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDTO setDefaultAddress(Long id, Long userId) {
        Address address = addressRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        unsetDefaultAddress(userId);
        address.setIsDefault(true);
        return toDTO(addressRepository.save(address));
    }

    private void unsetDefaultAddress(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    addressRepository.save(addr);
                });
    }

    private AddressDTO toDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .label(address.getLabel())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.getIsDefault())
                .createdAt(address.getCreatedAt() != null ? address.getCreatedAt().toString() : null)
                .updatedAt(address.getUpdatedAt() != null ? address.getUpdatedAt().toString() : null)
                .build();
    }
}
