package com.dada_labs_two.chamavault.chama.dtos;
import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MerryGoRoundConfigDTO {
    private Boolean enable;
    private Long contributionAmount;
    private ContributionFrequency frequency;
    private Boolean beneficiaryContributes;
}
