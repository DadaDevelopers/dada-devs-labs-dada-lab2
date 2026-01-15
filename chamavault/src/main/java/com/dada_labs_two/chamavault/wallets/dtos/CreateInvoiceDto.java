package com.dada_labs_two.chamavault.wallets.dtos;

public record CreateInvoiceDto(
        long amountSats,
        String memo
) {}

