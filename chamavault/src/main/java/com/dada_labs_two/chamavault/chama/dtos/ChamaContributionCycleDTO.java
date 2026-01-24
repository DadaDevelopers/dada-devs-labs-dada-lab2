package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamaContributionCycleDTO {
    private Integer cycleReference;
    private Long currentTotalContributionAmount;
    private Long expectedTotalContributionAmount;
    private String beneficiaryName;
    private Integer rotationIndex;
    private ContributionCycleStatus status;
    private ZonedDateTime startAt;
    private ZonedDateTime endAt;
    private List<String> usersAlreadyContributed;
}
