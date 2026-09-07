package com.dada_labs_two.chamavault.fees.dtos;

import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;

import java.math.BigDecimal;
import java.util.UUID;

public record FeeQuote(TransactionCategory category, long amountSats, long platformFeeSats, long totalSats,
                       BigDecimal percentage, UUID feeRuleReference) {
}
