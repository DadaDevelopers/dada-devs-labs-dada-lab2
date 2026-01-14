package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

import java.time.ZonedDateTime;

public record PaymentStatus(
        String payment_hash,
        boolean paid,
        boolean out,
        long amount,       // millisats (negative for outgoing)
        String memo,
        String bolt11,
        ZonedDateTime time
) {}


