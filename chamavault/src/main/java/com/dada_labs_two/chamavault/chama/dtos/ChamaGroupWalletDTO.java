package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamaGroupWalletDTO {
    private String walletPurpose;
    private WalletType walletType;
    private Long balanceSats;
    private Long lnBitsbalanceSats;
    private Boolean active;
    private Map<String, String> lightning = new HashMap<>();
    private ZonedDateTime createdAt;
}
