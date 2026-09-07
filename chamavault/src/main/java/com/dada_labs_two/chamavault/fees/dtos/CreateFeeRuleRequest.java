package com.dada_labs_two.chamavault.fees.dtos;

import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

public record CreateFeeRuleRequest(@NotNull TransactionCategory category,
                                   @NotNull @DecimalMin("0.0") @DecimalMax("100.0") BigDecimal percentage,
                                   @PositiveOrZero Long minimumFeeSats, @Positive Long maximumFeeSats,
                                   ZonedDateTime effectiveFrom, ZonedDateTime effectiveUntil) {
}
