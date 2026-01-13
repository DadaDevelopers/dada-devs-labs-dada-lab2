package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record PayInvoiceResponse(
        String payment_hash,
        boolean paid
) {}

