package com.quickbite.repository;

import com.quickbite.entity.User;
import com.quickbite.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByRole(UserRole role);
    List<User> findByIsActive(Boolean isActive);
    List<User> findByFullNameContainingIgnoreCase(String name);
    Optional<User> findByOauthProviderAndOauthId(String provider, String oauthId);
    long countByRole(UserRole role);
}
