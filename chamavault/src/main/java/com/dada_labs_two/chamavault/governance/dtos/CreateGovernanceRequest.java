package com.dada_labs_two.chamavault.governance.dtos;
import com.dada_labs_two.chamavault.governance.constants.GovernanceAction;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
public record CreateGovernanceRequest(
        @NotNull GovernanceAction action,
        @NotNull Map<String,String> parameters,
        String reason
) {}
