package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateChamaInviteDTO {
    @NotNull(message = "chamaReferenceId is a required field")
    private UUID chamaReferenceId;

    @NotBlank(message = "adminPhone is required")
    private String adminPhone;

    @NotNull(message = "specify if to join chama, member requires admin approval")
    private Boolean requiresApproval;

    @NotNull(message = "specify the open role in the chama")
    private ChamaRole role;
}
