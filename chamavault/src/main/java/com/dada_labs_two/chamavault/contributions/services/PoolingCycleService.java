package com.dada_labs_two.chamavault.contributions.services;

import com.dada_labs_two.chamavault.chama.constants.*;
import com.dada_labs_two.chamavault.chama.models.*;
import com.dada_labs_two.chamavault.chama.repositories.*;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.PoolingCycle;
import com.dada_labs_two.chamavault.contributions.repositories.PoolingCycleRepository;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.ZonedDateTime;
import java.util.*;
import com.dada_labs_two.chamavault.chama.activities.*;

@Service @RequiredArgsConstructor @Slf4j
public class PoolingCycleService {
    private final PoolingCycleRepository cycleRepository;
    private final ChamaRepository chamaRepository;
    private final ChamaRulesRepository rulesRepository;
    private final ChamaMemberRepository memberRepository;
    private final WalletRepository walletRepository;
    private final ProfileActionService notifications;
    private final MemberContributionObligationService obligationService;
    private final ChamaActivityService activityService;

    @Scheduled(cron = "${chama.cycles.cron:0 */30 * * * *}")
    @Transactional
    public void managePoolingCycles() {
        ZonedDateTime now = ZonedDateTime.now();
        for (PoolingCycle cycle : cycleRepository.findByStatusAndEndAtBefore(ContributionCycleStatus.ACTIVE, now)) {
            cycle.setStatus(ContributionCycleStatus.CLOSED);
            cycleRepository.save(cycle);
            activityService.record(cycle.getChama(), null, ChamaActivityType.POOLING_CYCLE_CLOSED, ActivityCategory.CONTRIBUTION,
                    "Pooling cycle closed", "Pooling contribution period " + cycle.getSequenceNumber() + " closed",
                    "POOLING_CYCLE", cycle.getReference().toString(), null, cycle.getWallet().getWalletReference(), null, null,
                    "POOLING_CYCLE_CLOSED:" + cycle.getReference(), Map.of());
        }
        for (Chama chama : chamaRepository.findAll()) {
            if (purpose(chama).supportsPooling()) {
                try { getOrCreateActive(chama.getChamaReference()); }
                catch (Exception e) { log.error("Unable to create pooling cycle for chama {}", chama.getChamaReference(), e); }
            }
        }
    }

    @Transactional
    public PoolingCycle getOrCreateActive(UUID chamaReference) {
        Optional<PoolingCycle> current = cycleRepository.findByChama_ChamaReferenceAndStatus(
                chamaReference, ContributionCycleStatus.ACTIVE);
        if (current.isPresent()) return current.get();

        Chama chama = chamaRepository.findByReferenceForUpdate(chamaReference)
                .orElseThrow(() -> new IllegalArgumentException("Chama not found"));
        if (!purpose(chama).supportsPooling())
            throw new IllegalStateException("This chama is not configured for pooled-goal contributions");
        current = cycleRepository.findByChama_ChamaReferenceAndStatus(chamaReference, ContributionCycleStatus.ACTIVE);
        if (current.isPresent()) return current.get();

        ChamaRules rules = rulesRepository.findByChama(chama).orElseThrow();
        Wallet wallet = walletRepository.findByOwnerReferenceAndWalletTypeAndChamaAndActive(
                chamaReference, WalletType.CHAMA_GROUP, chama, true)
                .orElseThrow(() -> new IllegalStateException("Pooling chama has no active group wallet"));
        if (wallet.getTargetAmountSats() != null && wallet.getBalanceSats() >= wallet.getTargetAmountSats())
            throw new IllegalStateException("Pooling target has already been reached");

        List<ChamaMember> members = memberRepository.findAllByChama_ChamaReferenceAndStatus(
                chamaReference, MembershipStatus.ACTIVE);
        if (members.isEmpty()) throw new IllegalStateException("Pooling chama has no active members");
        ZonedDateTime start = ZonedDateTime.now();
        PoolingCycle cycle = cycleRepository.save(PoolingCycle.builder().chama(chama).wallet(wallet)
                .sequenceNumber(cycleRepository.countByChama_ChamaReference(chamaReference) + 1)
                .contributionAmount(rules.effectivePoolingAmount()).currentTotalContributionAmount(0L)
                .expectedTotalContributionAmount(Math.multiplyExact((long) members.size(), rules.effectivePoolingAmount()))
                .status(ContributionCycleStatus.ACTIVE).startAt(start)
                .endAt(endDate(start, rules.effectivePoolingFrequency())).build());
        obligationService.createFor(cycle, members);
        activityService.record(chama, null, ChamaActivityType.POOLING_CYCLE_STARTED, ActivityCategory.CONTRIBUTION,
                "Pooling cycle started", "Members are expected to contribute " + cycle.getContributionAmount() + " sats",
                "POOLING_CYCLE", cycle.getReference().toString(), cycle.getContributionAmount(), wallet.getWalletReference(), null, null,
                "POOLING_CYCLE_STARTED:" + cycle.getReference(), Map.of("expectedTotalSats", cycle.getExpectedTotalContributionAmount().toString()));
        members.forEach(member -> notifications.notifyPoolingContributionDue(member.getUser(), cycle));
        return cycle;
    }

    public Page<PoolingCycle> list(UUID chamaReference, Pageable pageable) {
        return cycleRepository.findByChama_ChamaReference(chamaReference, pageable);
    }

    private ChamaPurpose purpose(Chama chama) {
        return chama.getPurpose() == null ? ChamaPurpose.MERRY_GO_ROUND : chama.getPurpose();
    }
    private ZonedDateTime endDate(ZonedDateTime start, ContributionFrequency frequency) {
        return switch (frequency) {
            case MINUTELY -> start.plusMinutes(1); case HOURLY -> start.plusHours(1);
            case DAILY -> start.plusDays(1); case WEEKLY -> start.plusWeeks(1);
            case FORTNIGHTLY -> start.plusWeeks(2); case MONTHLY -> start.plusMonths(1);
            case QUARTERLY -> start.plusMonths(3); case YEARLY -> start.plusYears(1);
        };
    }
}
