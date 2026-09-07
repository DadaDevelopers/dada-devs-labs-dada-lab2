package com.dada_labs_two.chamavault.chama.dtos;
import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PoolingConfigDTO {
    private Boolean enable;
    private Long contributionAmount;
    private ContributionFrequency frequency;
    private Long targetAmount;
    private Boolean requiresApproval;
    private Integer requiredApprovals;
}
