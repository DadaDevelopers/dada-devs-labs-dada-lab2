package com.dada_labs_two.chamavault.chama.dtos;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import com.dada_labs_two.chamavault.chama.models.Chama;
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
public class ChamaInviteDTO {
    private UUID inviteReference;
    private Chama chama;
    private String inviteCode;
    private ChamaRole role;
    private Boolean requiresApproval;
    private Boolean used;
    private Boolean paused;
    private ZonedDateTime expiresAt;
    private ZonedDateTime createdAt;
}
