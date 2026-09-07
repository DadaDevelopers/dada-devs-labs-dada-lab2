package com.dada_labs_two.chamavault.contributions.dtos;

import java.time.ZonedDateTime;
import java.util.UUID;

public record GroupWalletContributionResponse(UUID contributionReference,
                                              UUID poolingCycleReference,
                                              UUID walletReference,
                                              long amountSats,
                                              long totalContributionSats,
                                              Long targetAmountSats,
                                              long remainingToTargetSats,
                                              long platformFeeSats,
                                              long totalChargedSats,
                                              UUID feeRuleReference,
                                              String paymentReference,
                                              String feePaymentReference,
                                              ZonedDateTime contributedAt) {
}
