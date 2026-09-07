package com.dada_labs_two.chamavault.contributions.controllers;

import com.dada_labs_two.chamavault.contributions.dtos.*;
import com.dada_labs_two.chamavault.contributions.services.GroupWalletContributionService;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/chamas/{chamaId}/group-wallets/{walletId}/contributions")
public class GroupWalletContributionController {
    private final GroupWalletContributionService service;
    @PostMapping
    public ResponseEntity<GroupWalletContributionResponse> contribute(@PathVariable UUID chamaId,
            @PathVariable UUID walletId, @AuthenticationPrincipal User user,
            @Valid @RequestBody GroupWalletContributionRequest request) {
        return ResponseEntity.ok(service.contribute(chamaId, walletId, user, request));
    }
}
