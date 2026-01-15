package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

import java.time.ZonedDateTime;

public record InvoiceResponse(
        String payment_hash,
        String payment_request,
        Boolean paid,
        String bolt11,
        String paymentHash,
        Long amountSats,
        Long amountMsats,
        String qr,
        ZonedDateTime expiresAt
) {}

