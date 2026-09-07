package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import com.dada_labs_two.chamavault.chama.constants.ChamaPurpose;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonAlias;

import java.util.UUID;

@Data
public class CreateChamaDTO {

    /** Defaults to MERRY_GO_ROUND for backward compatibility. */
    private ChamaPurpose purpose = ChamaPurpose.MERRY_GO_ROUND;

    @NotBlank(message = "chama name is required")
    private String name;
    private String description;
    private String iconUrl;

    @NotNull(message = "chama visibility is required")
    private ChamaVisibility visibility;
    @NotNull(message = "maxMembers is required")
    @JsonAlias("maximumMembers")
    private Integer maxMembers;
    @NotNull(message = "creatorId is required")
    private UUID creatorId;

    // Rules
    private Boolean requiresApproval;
    private Integer requiredApprovals;
    private ContributionFrequency frequency;
    private Long contributionAmount;
    private Long dailyLimitSats;

    /** Deprecated compatibility field. POOLING and BOTH always provision a group wallet. */
    @Deprecated
    private Boolean createGroupWallet = false;
    /** Required and positive when createGroupWallet is true. */
    private Long groupWalletTargetAmountSats;

    private PoolingConfig poolingConfig;
    private MerryGoRoundConfig merryGoRoundConfig;

    @Data
    public static class PoolingConfig {
        private Boolean enable = true;
        private Long contributionAmount;
        private ContributionFrequency frequency;
        private Long targetAmount;
        private Boolean requiresApproval = false;
        private Integer requiredApprovals = 0;
    }

    @Data
    public static class MerryGoRoundConfig {
        private Boolean enable = true;
        private Long contributionAmount;
        private ContributionFrequency frequency;
        private Boolean beneficiaryContributes = false;
    }
}
