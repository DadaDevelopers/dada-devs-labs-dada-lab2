package com.dada_labs_two.chamavault.contributions.dtos;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChamaDTO {
    private UUID chamaReference;
    private String name;
    private String description;
    private Long contributionAmount;
    private ChamaVisibility visibility;
    private Integer maxMembers;
    private Integer currentRotationIndex;
}
