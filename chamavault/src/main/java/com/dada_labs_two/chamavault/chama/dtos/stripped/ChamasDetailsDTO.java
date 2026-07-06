package com.dada_labs_two.chamavault.chama.dtos.stripped;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.dtos.ChamaContributionCycleDTO;
import com.dada_labs_two.chamavault.chama.dtos.ChamaGroupWalletDTO;
import com.dada_labs_two.chamavault.chama.dtos.ChamaRulesDTO;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamasDetailsDTO {
    private ChamaDTO chama;
    private ChamaRulesDTO rules;
    private List<ChamaGroupWalletDTO> wallets;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChamaDTO {
        private UUID chamaReference;
        private String name;
        private String description;
        private Long contributionAmount;
        private ChamaVisibility visibility;
        private Integer maxMembers;
        private Integer currentRotationIndex;
        private ZonedDateTime createdAt;
        private ZonedDateTime deletedAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChamaGroupWalletDTO {
        private String walletPurpose;
        private Long balanceSats;
        private Boolean active;
        private ZonedDateTime createdAt;
    }
}
