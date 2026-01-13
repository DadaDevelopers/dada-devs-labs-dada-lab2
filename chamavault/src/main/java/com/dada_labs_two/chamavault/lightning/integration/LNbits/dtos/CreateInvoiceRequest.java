package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record CreateInvoiceRequest(
        long amount,        // millisats
        String memo,
        boolean out
) {}

/*
out = false → receive
out = true → pay
 */
