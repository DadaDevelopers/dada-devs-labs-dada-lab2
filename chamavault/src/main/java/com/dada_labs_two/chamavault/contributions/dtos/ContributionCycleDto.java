package com.dada_labs_two.chamavault.contributions.dtos;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContributionCycleDto {

    private Integer cycleReference;

    // Chama info (flattened, no entity)
    private ChamaDTO chama;

    // Contribution details
    private Long contributionAmount;
    private Long currentTotalContributionAmount;
    private Long expectedTotalContributionAmount;

    //wallet
    private  WalletDTO wallet;

    // Rotation info
    private Integer rotationIndex;
    private ContributionCycleStatus status;

    // Beneficiary (safe fields only)
    private UUID beneficiaryUserReference;
    private String beneficiaryUsername;
    private String beneficiaryMsisdn;

    // Timing
    private ZonedDateTime startAt;
    private ZonedDateTime endAt;

    // Meta
    private ZonedDateTime createdAt;

    // Useful computed flags
    private Boolean fullyFunded;
}

