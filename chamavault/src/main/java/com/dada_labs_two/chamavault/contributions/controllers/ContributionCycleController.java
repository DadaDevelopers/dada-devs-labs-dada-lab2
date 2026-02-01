package com.dada_labs_two.chamavault.contributions.controllers;

import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.services.ContributionCycleService;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/contribution-cycles")
@RequiredArgsConstructor
public class ContributionCycleController {
    private final ContributionCycleService contributionCycleService;

    @GetMapping("/chama/{chamaReference}")
    ResponseEntity<Page<ContributionCycle>> getAllContributionCycleForChama(@PathVariable UUID chamaReference,
                                                                            Pageable pageable) {
        return ResponseEntity.ok(contributionCycleService.findAllByChama(pageable, chamaReference));
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<ContributionCycle>> getUnpaidCycles(
            @AuthenticationPrincipal User user
    ) {
        List<ContributionCycle> cycles =
                contributionCycleService.getUnpaidContributionCycles(
                        user.getUserReference()
                );

        return ResponseEntity.ok(cycles);
    }



}
