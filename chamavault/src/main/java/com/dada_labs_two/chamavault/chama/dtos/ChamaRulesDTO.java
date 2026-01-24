package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamaRulesDTO {
    private Boolean requiresApproval;
    private Long contributionAmount;
    private Integer requiredApprovals;
    private ContributionFrequency frequency;
}
