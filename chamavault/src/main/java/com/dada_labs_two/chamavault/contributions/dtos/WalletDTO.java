package com.dada_labs_two.chamavault.contributions.dtos;


import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletDTO {
    private UUID walletReference;
    private WalletType walletType;
    private String walletPurpose;
    private Boolean active;
    private ZonedDateTime createdAt;
}
