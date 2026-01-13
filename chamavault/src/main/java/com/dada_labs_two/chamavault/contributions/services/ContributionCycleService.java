package com.dada_labs_two.chamavault.contributions.services;


import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.models.ChamaRules;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRulesRepository;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.repositories.ContributionCycleRepository;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionCycleService {
    private final ChamaRepository chamaRepository;
    private final ChamaRulesRepository chamaRulesRepository;
    private final ChamaMemberRepository chamaMemberRepository;
    private final ContributionCycleRepository cycleRepository;
    private final WalletRepository walletRepository;

    /* ============================
       Scheduler
     ============================ */
    @Scheduled(cron = "0 */30 * * * *") // every 30 minutes
    public void manageCycles() {
        closeExpiredCycles();
        createCyclesIfMissing();
    }

    @Transactional
    public ContributionCycle createNextCycle(UUID chamaReference) {
        // Lock chama to prevent concurrent rotation updates
        Chama chama = chamaRepository
                .findByReferenceForUpdate(chamaReference)
                .orElseThrow(() -> new IllegalStateException("Chama not found"));

        // Safety check (DB constraint should also exist)
        if (cycleRepository.existsByChamaAndStatus(chama, ContributionCycleStatus.ACTIVE)) {
            throw new IllegalStateException("Active cycle already exists");
        }

        ChamaRules rules = chamaRulesRepository
                .findByChama(chama)
                .orElseThrow(() -> new IllegalStateException("Chama rules not found"));

        List<ChamaMember> activeMembers =
                chamaMemberRepository
                        .findAllByChama_ChamaReferenceAndStatusOrderByJoinedAtAsc(
                                chamaReference,
                                MembershipStatus.ACTIVE
                        );

        if (activeMembers.isEmpty()) {
            throw new IllegalStateException("No active members");
        }


        int nextRotationIndex = chama.getCurrentRotationIndex() + 1;

        ChamaMember beneficiary =
                activeMembers.get((nextRotationIndex - 1) % activeMembers.size());

        Wallet wallet = createCycleWallet(chamaReference);

        ZonedDateTime startAt = ZonedDateTime.now();
        ZonedDateTime endAt = calculateEndDate(startAt, rules.getFrequency());

        ContributionCycle cycle = cycleRepository.save(
                ContributionCycle.builder()
                        .chama(chama)
                        .wallet(wallet)
                        .beneficiaryUser(beneficiary)
                        .rotationIndex(nextRotationIndex)
                        .status(ContributionCycleStatus.ACTIVE)
                        .startAt(startAt)
                        .endAt(endAt)
                        .build()
        );

        chama.setCurrentRotationIndex(nextRotationIndex);
        chamaRepository.save(chama);

        log.info(
                "Created cycle {} for chama {} beneficiary {}",
                nextRotationIndex,
                chamaReference,
                beneficiary.getUser().getUserReference()
        );

        return cycle;

    }

    @Transactional
    protected void closeExpiredCycles() {
        List<ContributionCycle> expired =
                cycleRepository.findByStatusAndEndAtBefore(
                        ContributionCycleStatus.ACTIVE,
                        ZonedDateTime.now()
                );

        for (ContributionCycle cycle : expired) {
            cycle.setStatus(ContributionCycleStatus.CLOSED);
            log.info(
                    "Closed cycle {} for chama {}",
                    cycle.getRotationIndex(),
                    cycle.getChama().getChamaReference()
            );
        }
    }

    @Transactional
    protected void createCyclesIfMissing() {
        List<Chama> chamas = chamaRepository.findAll();

        for (Chama chama : chamas) {
            boolean hasActive =
                    cycleRepository.existsByChamaAndStatus(
                            chama,
                            ContributionCycleStatus.ACTIVE
                    );

            if (!hasActive) {
                try {
                    createNextCycle(chama.getChamaReference());
                } catch (Exception e) {
                    log.error(
                            "Failed to create cycle for chama {}",
                            chama.getChamaReference(),
                            e
                    );
                }
            }
        }
    }


    private Wallet createCycleWallet(UUID chamaReference) {
        return walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CONTRIBUTION)
                        .ownerReference(chamaReference)
                        .balanceSats(0L)
                        .active(true)
                        .build()
        );
    }

    private ZonedDateTime calculateEndDate(
            ZonedDateTime start,
            ContributionFrequency frequency
    ) {
        return switch (frequency) {
            case MINUTELY -> start.plusMinutes(1);
            case HOURLY -> start.plusHours(1);
            case DAILY -> start.plusDays(1);
            case WEEKLY -> start.plusWeeks(1);
            case FORTNIGHTLY -> start.plusWeeks(2);
            case MONTHLY -> start.plusMonths(1);
            case QUARTERLY -> start.plusMonths(3);
            case YEARLY -> start.plusYears(1);
        };
    }

}
