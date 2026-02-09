package com.dada_labs_two.chamavault.wallets.dtos;

import java.time.ZonedDateTime;

public record InvoicePreviewDTO(
        Long amountSats,
        ZonedDateTime expiry,
        String memo,
        Long interimFeeSats
) {
}
