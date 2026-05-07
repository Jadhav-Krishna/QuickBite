package com.quickbite.controller;

import com.quickbite.dto.CreatePromoCodeRequest;
import com.quickbite.dto.PromoCodeDTO;
import com.quickbite.service.PromoCodeService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promo-codes")
@Slf4j
public class PromoCodeController {

    @Autowired
    private PromoCodeService promoCodeService;

    @PostMapping
    public ResponseEntity<PromoCodeDTO> createPromoCode(
            @Valid @RequestBody CreatePromoCodeRequest request,
            @RequestParam(value = "createdBy", required = false) Long createdBy) {
        log.info("Creating promo code: {}", request.getCode());
        PromoCodeDTO promoCode = promoCodeService.createPromoCode(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(promoCode);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromoCodeDTO> updatePromoCode(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreatePromoCodeRequest request) {
        log.info("Updating promo code with id: {}", id);
        PromoCodeDTO promoCode = promoCodeService.updatePromoCode(id, request);
        return ResponseEntity.ok(promoCode);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromoCode(@PathVariable("id") Long id) {
        log.info("Deleting promo code with id: {}", id);
        promoCodeService.deletePromoCode(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<PromoCodeDTO> togglePromoCodeStatus(@PathVariable("id") Long id) {
        log.info("Toggling promo code status for id: {}", id);
        PromoCodeDTO promoCode = promoCodeService.togglePromoCodeStatus(id);
        return ResponseEntity.ok(promoCode);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromoCodeDTO> getPromoCodeById(@PathVariable("id") Long id) {
        PromoCodeDTO promoCode = promoCodeService.getPromoCodeById(id);
        return ResponseEntity.ok(promoCode);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PromoCodeDTO> getPromoCodeByCode(@PathVariable("code") String code) {
        PromoCodeDTO promoCode = promoCodeService.getPromoCodeByCode(code);
        return ResponseEntity.ok(promoCode);
    }

    @GetMapping
    public ResponseEntity<List<PromoCodeDTO>> getAllPromoCodes() {
        List<PromoCodeDTO> promoCodes = promoCodeService.getAllPromoCodes();
        return ResponseEntity.ok(promoCodes);
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromoCodeDTO>> getActivePromoCodes() {
        List<PromoCodeDTO> promoCodes = promoCodeService.getActivePromoCodes();
        return ResponseEntity.ok(promoCodes);
    }

    @PostMapping("/validate")
    public ResponseEntity<PromoCodeDTO> validatePromoCode(
            @RequestParam("code") String code,
            @RequestParam("orderAmount") Double orderAmount) {
        log.info("Validating promo code: {} for amount: {}", code, orderAmount);
        try {
            com.quickbite.entity.PromoCode promoCode = promoCodeService.validatePromoCode(code, orderAmount);
            PromoCodeDTO dto = PromoCodeDTO.builder()
                    .id(promoCode.getId())
                    .code(promoCode.getCode())
                    .description(promoCode.getDescription())
                    .discountType(promoCode.getDiscountType().name())
                    .discountValue(promoCode.getDiscountValue())
                    .minOrderAmount(promoCode.getMinOrderAmount())
                    .maxDiscountAmount(promoCode.getMaxDiscountAmount())
                    .build();
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("Promo code validation failed: {}", e.getMessage());
            throw e;
        }
    }
}
