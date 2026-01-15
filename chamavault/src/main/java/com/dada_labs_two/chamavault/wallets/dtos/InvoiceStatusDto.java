package com.dada_labs_two.chamavault.wallets.dtos;

import com.dada_labs_two.chamavault.wallets.constants.InvoiceStatus;

import java.time.ZonedDateTime;

public record InvoiceStatusDto(
        String paymentHash,
        InvoiceStatus status,
        ZonedDateTime paidAt
) {}

