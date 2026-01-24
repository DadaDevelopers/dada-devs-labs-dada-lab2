package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamaDTO {
    private UUID chamaReference;
    private String name;
    private String description;
    private Long contributionAmount;
    private String iconUrl;
    private ChamaVisibility visibility;
    private Integer maxMembers;
    private Integer currentRotationIndex;
    private ChamaCreatorDTO  chamaCreator;
    private ZonedDateTime createdAt;
    private ZonedDateTime deletedAt;
}
