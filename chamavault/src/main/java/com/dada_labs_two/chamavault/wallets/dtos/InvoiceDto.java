package com.dada_labs_two.chamavault.wallets.dtos;

import java.time.ZonedDateTime;

public record InvoiceDto(
        String invoice,
        String paymentHash,
        long amountSats,
        long amountMsats,
        String qrCode,
        ZonedDateTime expiresAt
) {}

