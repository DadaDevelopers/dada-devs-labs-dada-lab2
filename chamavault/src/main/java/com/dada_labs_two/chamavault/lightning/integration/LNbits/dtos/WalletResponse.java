package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record WalletResponse(
        String id,
        String name,
        String admin_key,
        String invoice_key,
        String wallet_type,
        String inkey,
        String shared_wallet_id,
        String currency,
        String balance_msat
) {}

