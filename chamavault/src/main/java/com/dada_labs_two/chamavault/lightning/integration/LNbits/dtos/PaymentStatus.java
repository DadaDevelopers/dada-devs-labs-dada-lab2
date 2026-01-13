package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record PaymentStatus(
        String payment_hash,
        boolean paid,
        long amount
) {}

