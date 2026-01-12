package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateChamaDTO {

    @NotBlank(message = "chama name is required")
    private String name;
    @NotBlank(message = "chama name is required")
    private String description;
    private String iconUrl;

    @NotNull(message = "chama visibility is required")
    private ChamaVisibility visibility;
    @NotNull(message = "maxMembers is required")
    private Integer maxMembers;
    @NotNull(message = "creatorId is required")
    private UUID creatorId;

    // Rules
    @NotNull(message = "requiresApproval is required")
    private Boolean requiresApproval;
    @NotNull(message = "requiredApprovals is required")
    private Integer requiredApprovals;
    private Long dailyLimitSats;
}

