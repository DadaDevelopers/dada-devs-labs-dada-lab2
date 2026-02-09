package com.dada_labs_two.chamavault.wallets.dtos;

import java.util.UUID;

public record MakeInvoicePaymentDTO(UUID payerWalletId, String beneficiaryInvoice) {

    public MakeInvoicePaymentDTO {
        if (payerWalletId == null) throw new AssertionError("Payer wallet id is null");
        if (beneficiaryInvoice.isBlank()) throw new AssertionError("Beneficiary invoice is blank");
    }
}
