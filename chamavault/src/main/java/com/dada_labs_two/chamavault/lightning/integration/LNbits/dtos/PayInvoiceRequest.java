package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record PayInvoiceRequest(
        String bolt11,
        Boolean out
) {}

