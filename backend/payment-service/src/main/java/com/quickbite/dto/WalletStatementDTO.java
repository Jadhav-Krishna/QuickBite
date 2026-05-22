package com.quickbite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletStatementDTO {
    private Long id;
    private Long walletId;
    private String type;
    private BigDecimal amount;
    private String description;
    private LocalDateTime createdAt;
}
