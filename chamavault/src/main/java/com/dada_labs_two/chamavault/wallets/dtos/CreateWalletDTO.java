package com.dada_labs_two.chamavault.wallets.dtos;

import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateWalletDTO {
    private UUID chamaAffiliationRef;
    private UUID ownerReference;
    private String name;
    private WalletType walletType;
}
