package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

import java.time.ZonedDateTime;

public record PaymentStatus(
        Boolean paid,
        String status,
        String preimage,
        PaymentDetailsDTO details,

        String payment_hash,
        Boolean out,
        Long amount,       // millisats (negative for outgoing)
        Long fee_msat,    // msats (negative)
        String memo,
        String bolt11,
        ZonedDateTime time
) {}


