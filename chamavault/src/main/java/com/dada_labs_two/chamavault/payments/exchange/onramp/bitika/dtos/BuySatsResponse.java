package com.dada_labs_two.chamavault.payments.exchange.onramp.bitika.dtos;

public record BuySatsResponse(String transaction_code,
                              String status,
                              String message,
                              Long invoice_amount_sats,
                              Long kes_amount,
                              Long sats_to_send) {
}
