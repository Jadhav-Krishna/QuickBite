package com.quickbite.repository;

import com.quickbite.entity.WalletStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletStatementRepository extends JpaRepository<WalletStatement, Long> {
    List<WalletStatement> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
