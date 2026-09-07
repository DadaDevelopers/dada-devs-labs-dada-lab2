package com.dada_labs_two.chamavault.contributions.controllers;

import com.dada_labs_two.chamavault.contributions.constants.ObligationStatus;
import com.dada_labs_two.chamavault.contributions.dtos.*;
import com.dada_labs_two.chamavault.contributions.services.MemberContributionObligationService;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequiredArgsConstructor
@RequestMapping("/chamas/{chamaId}/contribution-obligations")
public class MemberContributionObligationController {
    private final MemberContributionObligationService service;
    @GetMapping
    public ResponseEntity<Page<ObligationDTO>> list(@PathVariable UUID chamaId, @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "true") boolean mine, @RequestParam(required = false) ObligationStatus status, Pageable page) {
        return ResponseEntity.ok(service.list(chamaId, user, mine, status, page));
    }
    @PostMapping("/{obligationId}/payments")
    public ResponseEntity<ObligationPaymentResponse> pay(@PathVariable UUID chamaId, @PathVariable UUID obligationId,
            @AuthenticationPrincipal User user, @Valid @RequestBody PayObligationRequest request) {
        return ResponseEntity.ok(service.pay(chamaId, obligationId, user, request));
    }
}
