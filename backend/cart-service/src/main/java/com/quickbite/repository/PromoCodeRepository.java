package com.quickbite.repository;

import com.quickbite.entity.PromoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromoCodeRepository extends JpaRepository<PromoCode, Long> {
    Optional<PromoCode> findByCodeAndIsActiveTrue(String code);
    
    Optional<PromoCode> findByCode(String code);
    
    List<PromoCode> findByIsActiveTrue();
    
    @Query("SELECT p FROM PromoCode p WHERE p.isActive = true AND p.validFrom <= :now AND p.validUntil >= :now")
    List<PromoCode> findActiveAndValidPromoCodes(LocalDateTime now);
    
    boolean existsByCode(String code);
}
