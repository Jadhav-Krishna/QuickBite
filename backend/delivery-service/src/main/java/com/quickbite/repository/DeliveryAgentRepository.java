package com.quickbite.repository;

import com.quickbite.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

    Optional<DeliveryAgent> findByUserId(Long userId);

    @Query("""
            SELECT a FROM DeliveryAgent a
            WHERE a.currentLatitude IS NOT NULL
              AND a.currentLongitude IS NOT NULL
              AND a.currentLatitude BETWEEN :latitude - :radiusDegrees AND :latitude + :radiusDegrees
              AND a.currentLongitude BETWEEN :longitude - :radiusDegrees AND :longitude + :radiusDegrees
            """)
    List<DeliveryAgent> findNearbyAgents(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusDegrees") Double radiusDegrees
    );
}
