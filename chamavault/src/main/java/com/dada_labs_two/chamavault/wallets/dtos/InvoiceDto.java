package com.dada_labs_two.chamavault.wallets.dtos;

import com.dada_labs_two.chamavault.wallets.constants.InvoiceStatus;

import java.time.ZonedDateTime;

public record InvoiceDto(
        String invoice,
        String paymentHash,
        long amountSats,
        long amountMsats,
        long amountFees,
        String qrCode,
        InvoiceStatus status,
        ZonedDateTime expiresAt
) {}

