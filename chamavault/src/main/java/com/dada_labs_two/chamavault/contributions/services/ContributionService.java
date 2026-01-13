package com.dada_labs_two.chamavault.contributions.services;


import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.models.ChamaRules;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRulesRepository;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.Contribution;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.repositories.ContributionCycleRepository;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionService {
    private final ContributionCycleRepository cycleRepository;
    private final ChamaMemberRepository chamaMemberRepository;
    private final WalletRepository walletRepository;
    private final ChamaRepository chamaRepository;
    private final ChamaRulesRepository chamaRulesRepository;

    /*
    Rotation Algorithm (Simple & Fair)
    Active members ordered by join date
    Rotation index determines beneficiary

Enforce one ACTIVE cycle per chama (DB-level)
    CREATE UNIQUE INDEX ux_active_cycle_per_chama
ON contribution_cycles (chama_reference)
WHERE status = 'ACTIVE';

     */
    @Transactional
    public ContributionCycle createNextCycle(UUID chamaReference) {
        Chama chama = chamaRepository.findById(chamaReference).orElseThrow();
        ChamaRules chamaRules = chamaRulesRepository.findByChama(chama).orElseThrow();
        // 1. Get active members
        List<ChamaMember> members =
                chamaMemberRepository.findAllByChama_ChamaReferenceAndStatus(chamaReference, MembershipStatus.ACTIVE);

        if (members.isEmpty())
            throw new RuntimeException("No active members");

        int rotationIndex = cycleRepository.countByChama_ChamaReference(chamaReference) + 1;

        ChamaMember beneficiary =
                members.get((rotationIndex - 1) % members.size());

        // 2. Create cycle wallet
        Wallet wallet = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CONTRIBUTION)
                        .ownerReference(chamaReference)
                        .balanceSats(0L)
                        .active(true)
                        .build()
        );

        // 3. Create cycle
        ContributionCycle cycle = cycleRepository.save(
                ContributionCycle.builder()
                        .chama(chama)
                        .wallet(wallet)
                        .beneficiaryUser(beneficiary)
                        .rotationIndex(rotationIndex)
                        .status(ContributionCycleStatus.ACTIVE)
                        .startAt(ZonedDateTime.now())
                        .endAt(ZonedDateTime.now().plusMonths(1))
                        .build()
        );

        return cycle;
    }
}
