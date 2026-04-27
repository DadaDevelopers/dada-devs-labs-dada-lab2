package com.dada_labs_two.chamavault.chama.controllers;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.dtos.*;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaInvite;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.services.ChamaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/chama")
@RequiredArgsConstructor
public class ChamaController {
    private final ChamaService chamaService;

    @PostMapping
    public ResponseEntity<Chama> initiateChamaCreation(@RequestBody CreateChamaDTO chama) {
        return ResponseEntity.ok(chamaService.createChama(chama));
    }

    @GetMapping
    public ResponseEntity<Page<Chama>> getAllChamas(Pageable pageable, @RequestParam(required = false) ChamaVisibility visibility) {
        return ResponseEntity.ok(chamaService.getChamas(pageable, visibility));
    }

    @GetMapping("/{chamaReference}")
    public ResponseEntity<ChamaDetailsDTO> getChamaById(@PathVariable UUID chamaReference) {
        return ResponseEntity.ok(chamaService.getChamaById(chamaReference));
    }

    @
    GetMapping("/{msisdn}/status/{status}")
    public ResponseEntity<List<Chama>> findChamasByUserMsisdnAndStatus(@PathVariable String msisdn,
                                                                       @PathVariable MembershipStatus status) {
        return ResponseEntity.ok(chamaService.findChamasByUserMsisdn(msisdn, status));
    }

    @PostMapping("/create/invite")
    public ResponseEntity<ChamaInviteDTO>  createChamaInvite(@RequestBody CreateChamaInviteDTO invite) {
        return ResponseEntity.ok(toChamaInviteDTO(chamaService.generateChamaInvite(invite)));
    }

    @PutMapping("/pause/invites/{inviteCode}")
    public ResponseEntity<String> pauseChamaInvite(@PathVariable String inviteCode) {
        chamaService.pauseInvites(inviteCode);
        return ResponseEntity.ok("status for the invite successfully paused");
    }

    @GetMapping("/fetch/invites/{chamaReferenceId}")
    public ResponseEntity<Page<ChamaInviteDTO>> fetchChamaInviteCodes(Pageable page,@PathVariable UUID chamaReferenceId) {
        Page<ChamaInviteDTO> chamaInviteDTOS = chamaService.fetchChamaInviteCodes(page, chamaReferenceId)
                .map(this::toChamaInviteDTO);

        return ResponseEntity.ok(chamaInviteDTOS);
    }

    @GetMapping("/{chamaReference}/members-by-status/{status}")
    public ResponseEntity<List<ChamaMember>> findMembersByChamaAndStatus(@PathVariable UUID chamaReference,
                                                                         @PathVariable MembershipStatus status) {
        return ResponseEntity.ok(chamaService.findMembersByChamaAndStatus(chamaReference, status));
    }

    @PostMapping("/join/invite")
    public ResponseEntity<ChamaMember> joinChamaByInviteCode(@RequestBody JoinChamaByInviteCodeDTO joinChama) {
        return ResponseEntity.ok(chamaService.joinChamaByInviteCode(joinChama));
    }

    @PostMapping("/join/{chamaId}/request")
    public ResponseEntity<ChamaMember> requestToJoinChama(@PathVariable UUID chamaId,
                                                          @RequestParam ChamaRole role,
                                                          @RequestParam String joinerPhone) {
        return ResponseEntity.ok(chamaService.requestToJoinChama(chamaId, role, joinerPhone));
    }

    @GetMapping("/members-by-status")
    public ResponseEntity<Page<ChamaMember>> getChamaMembersByStatus(Pageable pageable,
                                                                     @RequestParam MembershipStatus status,
                                                                     @RequestParam UUID chamaReferenceId) {
        return ResponseEntity.ok(chamaService.fetchChamaMembersByStatus(pageable, chamaReferenceId, status));
    }

    @PostMapping("/{chamaId}/members/{memberId}/{action}")
    public ResponseEntity<ChamaMember> approveUserRequestToJoinChama(@PathVariable UUID chamaId,
                                                                     @PathVariable String action,
                                                                     @RequestParam String approverPhone,
                                                                     @PathVariable UUID memberId,
                                                                     @RequestParam MembershipStatus status) {
        return ResponseEntity.ok(chamaService.approveUserRequestToJoinChama(
                chamaId, approverPhone, memberId, status, action));
    }

    @PostMapping("/recommend")
    public ResponseEntity<List<ChamaRecommendationDTO>> recommendChamas(
            @RequestBody ChamaRecommendationRequest request) {
        return ResponseEntity.ok(chamaService.recommendChamas(request));
    }


    ChamaInviteDTO toChamaInviteDTO(ChamaInvite chamaInvite) {
        return ChamaInviteDTO.builder()
                .inviteReference(chamaInvite.getInviteReference())
                .chama(chamaInvite.getChama())
                .inviteCode(chamaInvite.getInviteCode().getCode())
                .role(chamaInvite.getRole())
                .requiresApproval(chamaInvite.getRequiresApproval())
                .used(chamaInvite.getUsed())
                .paused(chamaInvite.getPaused())
                .createdAt(chamaInvite.getCreatedAt())
                .expiresAt(chamaInvite.getExpiresAt())
                .build();
    }
}
