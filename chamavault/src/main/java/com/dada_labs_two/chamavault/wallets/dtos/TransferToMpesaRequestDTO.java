package com.dada_labs_two.chamavault.wallets.dtos;

import java.util.UUID;

public record TransferToMpesaRequestDTO(String recipientMsisdn,
                                        Long amountInMilliSats,
                                        UUID payerWalletId) {
    public TransferToMpesaRequestDTO {
        if (payerWalletId == null) throw new AssertionError("payerWalletId is null");
        if (recipientMsisdn.isBlank()) throw new AssertionError("recipientMsisdn is blank");
        if (amountInMilliSats < 146000) throw new AssertionError("amountInMilliSats needs to be more than 146000");
        if (amountInMilliSats > 97550000) throw new AssertionError("amountInMilliSats needs to be less than 97550000");
    }
}
