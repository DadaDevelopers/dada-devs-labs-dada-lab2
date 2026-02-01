package com.dada_labs_two.chamavault.contributions.controllers;

import com.dada_labs_two.chamavault.contributions.dtos.ChamaDTO;
import com.dada_labs_two.chamavault.contributions.dtos.ContributionCycleDto;
import com.dada_labs_two.chamavault.contributions.dtos.WalletDTO;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.services.ContributionCycleService;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<Page<ContributionCycleDto>> getUnpaidCycles(
            @PageableDefault(size = 10, sort = "startAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam UUID userReference
    ) {
        Page<ContributionCycle> cycles =
                contributionCycleService.getUnpaidContributionCycles(
                        userReference, pageable
                );

        Page<ContributionCycleDto> dtoPage = cycles.map(this::toDto);

        return ResponseEntity.ok(dtoPage);
    }




    public ContributionCycleDto toDto(ContributionCycle cycle) {
        Long currentTotalContributionAmount = cycle.getCurrentTotalContributionAmount() == null ? 0L : cycle.getCurrentTotalContributionAmount();
        Long expectedTotalContributionAmount = cycle.getExpectedTotalContributionAmount() == null ? 0L : cycle.getExpectedTotalContributionAmount();

        return ContributionCycleDto.builder()
                .cycleReference(cycle.getCycleReference())

                // Chama
                .chama(ChamaDTO.builder()
                        .chamaReference(cycle.getChama().getChamaReference())
                        .name(cycle.getChama().getName())
                        .description(cycle.getChama().getDescription())
                        .contributionAmount(cycle.getChama().getContributionAmount())
                        .visibility(cycle.getChama().getVisibility())
                        .maxMembers(cycle.getChama().getMaxMembers())
                        .currentRotationIndex(cycle.getChama().getCurrentRotationIndex())
                        .build())

                // Amounts
                .contributionAmount(cycle.getContributionAmount())
                .currentTotalContributionAmount(
                        currentTotalContributionAmount
                )
                .expectedTotalContributionAmount(
                        expectedTotalContributionAmount
                )

                //wallet
                .wallet(WalletDTO.builder()
                        .walletReference(cycle.getWallet().getWalletReference())
                        .walletType(cycle.getWallet().getWalletType())
                        .walletPurpose(cycle.getWallet().getWalletPurpose())
                        .active(cycle.getWallet().getActive())
                        .createdAt(cycle.getWallet().getCreatedAt())
                        .build())

                // Rotation
                .rotationIndex(cycle.getRotationIndex())
                .status(cycle.getStatus())

                // Beneficiary
                .beneficiaryUserReference(
                        cycle.getBeneficiaryUser().getUser().getUserReference()
                )
                .beneficiaryUsername(
                        cycle.getBeneficiaryUser().getUser().getUsername()
                )
                .beneficiaryMsisdn(cycle.getBeneficiaryUser().getUser().getMsisdn())

                // Dates
                .startAt(cycle.getStartAt())
                .endAt(cycle.getEndAt())
                .createdAt(cycle.getCreatedAt())

                // Computed
                .fullyFunded(
                        currentTotalContributionAmount >=
                                expectedTotalContributionAmount
                )
                .build();
    }

}
