package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record PayInvoiceResponse(
        String checking_id,
        String payment_hash,
        Boolean paid,
        String preimage
) {}


