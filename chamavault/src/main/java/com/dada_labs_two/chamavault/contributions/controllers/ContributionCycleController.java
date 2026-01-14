package com.dada_labs_two.chamavault.contributions.controllers;

import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.services.ContributionCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
