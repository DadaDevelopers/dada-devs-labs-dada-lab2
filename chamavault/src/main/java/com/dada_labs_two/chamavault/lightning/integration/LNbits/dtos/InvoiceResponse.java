package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record InvoiceResponse(
        String payment_hash,
        String payment_request,
        boolean paid
) {}

