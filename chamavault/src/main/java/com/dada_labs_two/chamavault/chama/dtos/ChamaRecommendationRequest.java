package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import lombok.Data;

@Data
public class ChamaRecommendationRequest {
    private String goal;
    private Long monthlyContribution;
    private String riskTolerance;
    private ContributionFrequency frequency;
    private Integer preferredGroupSize;
}
