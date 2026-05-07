package com.quickbite.service;

import com.quickbite.dto.CreatePromoCodeRequest;
import com.quickbite.dto.PromoCodeDTO;
import com.quickbite.entity.PromoCode;
import com.quickbite.repository.PromoCodeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PromoCodeService {

    @Autowired
    private PromoCodeRepository promoCodeRepository;

    @Transactional
    public PromoCodeDTO createPromoCode(CreatePromoCodeRequest request, Long createdBy) {
        log.info("Creating promo code: {}", request.getCode());

        if (promoCodeRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Promo code already exists: " + request.getCode());
        }

        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new RuntimeException("Valid until date must be after valid from date");
        }

        PromoCode promoCode = new PromoCode();
        promoCode.setCode(request.getCode().toUpperCase());
        promoCode.setDescription(request.getDescription());
        promoCode.setDiscountType(PromoCode.DiscountType.valueOf(request.getDiscountType()));
        promoCode.setDiscountValue(request.getDiscountValue());
        promoCode.setMinOrderAmount(request.getMinOrderAmount());
        promoCode.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promoCode.setUsageLimit(request.getUsageLimit());
        promoCode.setUsageCount(0);
        promoCode.setIsActive(true);
        promoCode.setValidFrom(request.getValidFrom());
        promoCode.setValidUntil(request.getValidUntil());
        promoCode.setCreatedBy(createdBy);

        promoCode = promoCodeRepository.save(promoCode);
        log.info("Promo code created successfully: {}", promoCode.getCode());

        return convertToDTO(promoCode);
    }

    @Transactional
    public PromoCodeDTO updatePromoCode(Long id, CreatePromoCodeRequest request) {
        log.info("Updating promo code with id: {}", id);

        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));

        // Check if code is being changed and if new code already exists
        if (!promoCode.getCode().equals(request.getCode().toUpperCase())) {
            if (promoCodeRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("Promo code already exists: " + request.getCode());
            }
            promoCode.setCode(request.getCode().toUpperCase());
        }

        if (request.getValidUntil().isBefore(request.getValidFrom())) {
            throw new RuntimeException("Valid until date must be after valid from date");
        }

        promoCode.setDescription(request.getDescription());
        promoCode.setDiscountType(PromoCode.DiscountType.valueOf(request.getDiscountType()));
        promoCode.setDiscountValue(request.getDiscountValue());
        promoCode.setMinOrderAmount(request.getMinOrderAmount());
        promoCode.setMaxDiscountAmount(request.getMaxDiscountAmount());
        promoCode.setUsageLimit(request.getUsageLimit());
        promoCode.setValidFrom(request.getValidFrom());
        promoCode.setValidUntil(request.getValidUntil());

        promoCode = promoCodeRepository.save(promoCode);
        log.info("Promo code updated successfully: {}", promoCode.getCode());

        return convertToDTO(promoCode);
    }

    @Transactional
    public void deletePromoCode(Long id) {
        log.info("Deleting promo code with id: {}", id);
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        promoCodeRepository.delete(promoCode);
        log.info("Promo code deleted successfully: {}", promoCode.getCode());
    }

    @Transactional
    public PromoCodeDTO togglePromoCodeStatus(Long id) {
        log.info("Toggling promo code status for id: {}", id);
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        
        promoCode.setIsActive(!promoCode.getIsActive());
        promoCode = promoCodeRepository.save(promoCode);
        
        log.info("Promo code status toggled: {} - Active: {}", promoCode.getCode(), promoCode.getIsActive());
        return convertToDTO(promoCode);
    }

    @Transactional(readOnly = true)
    public PromoCodeDTO getPromoCodeById(Long id) {
        PromoCode promoCode = promoCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        return convertToDTO(promoCode);
    }

    @Transactional(readOnly = true)
    public PromoCodeDTO getPromoCodeByCode(String code) {
        PromoCode promoCode = promoCodeRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        return convertToDTO(promoCode);
    }

    @Transactional(readOnly = true)
    public List<PromoCodeDTO> getAllPromoCodes() {
        return promoCodeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PromoCodeDTO> getActivePromoCodes() {
        return promoCodeRepository.findActiveAndValidPromoCodes(LocalDateTime.now()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PromoCode validatePromoCode(String code, Double orderAmount) {
        log.info("Validating promo code: {} for order amount: {}", code, orderAmount);

        PromoCode promoCode = promoCodeRepository.findByCodeAndIsActiveTrue(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid promo code"));

        if (!promoCode.isValid()) {
            throw new RuntimeException("Promo code is expired or usage limit reached");
        }

        if (orderAmount < promoCode.getMinOrderAmount()) {
            throw new RuntimeException(String.format("Minimum order amount of ₹%.2f required for this promo code", 
                    promoCode.getMinOrderAmount()));
        }

        log.info("Promo code validated successfully: {}", code);
        return promoCode;
    }

    @Transactional
    public void incrementUsageCount(Long promoCodeId) {
        PromoCode promoCode = promoCodeRepository.findById(promoCodeId)
                .orElseThrow(() -> new RuntimeException("Promo code not found"));
        promoCode.setUsageCount(promoCode.getUsageCount() + 1);
        promoCodeRepository.save(promoCode);
        log.info("Promo code usage count incremented: {} - Count: {}", promoCode.getCode(), promoCode.getUsageCount());
    }

    private PromoCodeDTO convertToDTO(PromoCode promoCode) {
        return PromoCodeDTO.builder()
                .id(promoCode.getId())
                .code(promoCode.getCode())
                .description(promoCode.getDescription())
                .discountType(promoCode.getDiscountType().name())
                .discountValue(promoCode.getDiscountValue())
                .minOrderAmount(promoCode.getMinOrderAmount())
                .maxDiscountAmount(promoCode.getMaxDiscountAmount())
                .usageLimit(promoCode.getUsageLimit())
                .usageCount(promoCode.getUsageCount())
                .isActive(promoCode.getIsActive())
                .validFrom(promoCode.getValidFrom())
                .validUntil(promoCode.getValidUntil())
                .createdBy(promoCode.getCreatedBy())
                .createdAt(promoCode.getCreatedAt())
                .updatedAt(promoCode.getUpdatedAt())
                .build();
    }
}
