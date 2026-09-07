package com.dada_labs_two.chamavault.chama.dtos;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ChamaPoolingCycleDTO {
 private UUID cycleReference;
 private UUID groupWalletReference;
 private Integer sequenceNumber;
 private Long contributionAmount;
 private Long currentTotalContributionAmount;
 private Long expectedTotalContributionAmount;
 private ContributionCycleStatus status;
 private ZonedDateTime startAt;
 private ZonedDateTime endAt;
}
