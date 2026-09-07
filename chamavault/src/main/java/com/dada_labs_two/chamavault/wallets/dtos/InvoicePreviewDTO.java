package com.dada_labs_two.chamavault.wallets.dtos;

import java.time.ZonedDateTime;
import java.math.BigDecimal;
import java.util.UUID;

public record InvoicePreviewDTO(
        Long amountSats,
        ZonedDateTime expiry,
        String memo,
        Long platformFeeSats,
        Long totalSats,
        BigDecimal feePercentage,
        UUID feeRuleReference
) {
}
