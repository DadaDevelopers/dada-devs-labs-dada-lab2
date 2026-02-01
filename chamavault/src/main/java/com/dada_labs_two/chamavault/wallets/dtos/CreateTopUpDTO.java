package com.dada_labs_two.chamavault.wallets.dtos;

import java.util.UUID;

public record CreateTopUpDTO(UUID senderWalletId, UUID recipientWalletId, Long amountSats, String memo) {
}
