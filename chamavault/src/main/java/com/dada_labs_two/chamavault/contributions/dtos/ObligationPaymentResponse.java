package com.dada_labs_two.chamavault.contributions.dtos;
import com.dada_labs_two.chamavault.contributions.constants.ObligationStatus;
import java.util.UUID;
public record ObligationPaymentResponse(UUID paymentReference, UUID obligationReference, long amountPaidSats,
        long totalPaidSats, long outstandingAmountSats, ObligationStatus status,
        long cycleCollectedSats, long cycleExpectedSats, long platformFeeSats, long totalDebitedSats,
        String lightningPaymentReference) {}
