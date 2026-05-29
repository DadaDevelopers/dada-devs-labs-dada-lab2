package com.dada_labs_two.chamavault.payments.dtos;

import java.util.UUID;

public record FundWalletByMpesa(
        String phoneNumber,
        UUID walletId,
        Long amountSats
) {
}
