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
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.LnurlPayLinkResponse;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContributionCycleService {
    private final LightningWalletService lightningWalletService;
    private final ProfileActionService profileActionService;
    private final ChamaRepository chamaRepository;
    private final ChamaRulesRepository chamaRulesRepository;
    private final ChamaMemberRepository chamaMemberRepository;
    private final ContributionCycleRepository cycleRepository;
    private final WalletRepository walletRepository;

    /* ============================
       Scheduler
     ============================ */
    @Scheduled(cron = "0 */10 * * * *") // every 30 minutes
    @Transactional
    public void manageCycles() {
        closeExpiredCycles();
        createCyclesIfMissing();
    }


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

        Wallet wallet = createCycleWallet(beneficiary, rules, nextRotationIndex);

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
                        .contributionAmount(rules.getContributionAmount())
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

        //notify
        profileActionService.createProfileActions(beneficiary.getUser(), Activity.STARTED,"Your turn",
                "chama contribution cycle created successfully",
                "Youre next in the contribution cycle, expect contributions by " + cycle.getEndAt(),
                "[Admins]: ",
                cycle.getEndAt());

        for (ChamaMember member : activeMembers) {
            if (member == beneficiary) continue;

            profileActionService.createProfileActions(member.getUser(), Activity.WAITING,"Contributions Expected",
                    "chama contribution cycle created successfully",
                    "contribution cycle, Deadline is " + cycle.getEndAt(),
                    "[Admins]: "+ beneficiary.getUser().getUsername()+ " is expecting your contributions for chama cycle "
                            + chama.getCurrentRotationIndex() + " please make your payments before "+ cycle.getEndAt(),
                    cycle.getEndAt());
        }

        return cycle;

    }

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
        log.info("createCyclesIfMissing");
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


    private Wallet createCycleWallet(ChamaMember chamaMember, ChamaRules rules, int nextRotationIndex) {
        //5. Create Individual lightning Wallet
        WalletResponse lw= lightningWalletService.createUserWallet("contribution for " +
                chamaMember.getUser().getUsername() + " chama rotation: "+ nextRotationIndex);
        log.info("LW created user wallet: {}", lw);

        Map<String, String> lightningMap = new HashMap<>();
        lightningMap.put("id", lw.id());
        lightningMap.put("walletName", lw.name());
        lightningMap.put("adminkey", lw.adminkey());
        lightningMap.put("invoice_key", lw.invoice_key());
        lightningMap.put("wallet_type", lw.wallet_type());
        lightningMap.put("inkey", lw.inkey());
        lightningMap.put("shared_wallet_id", lw.shared_wallet_id());
        lightningMap.put("currency", lw.currency());
        lightningMap.put("balance_msat", lw.balance_msat());

        //6. Assign group lightning  address
        String lnUsername = chamaMember.getUser().getUsername()
                .concat("-rotation-").concat(nextRotationIndex +"")
                .toLowerCase()
                .replaceAll("[^a-z0-9_-]", "-");
        long min = rules.getContributionAmount();        // sat
        long max = 1_000_000_000; // 1,000,000 sats
        LnurlPayLinkResponse lnAddress  = lightningWalletService.createLightningAddress(lw.adminkey(),
                "contribution lightning address for beneficiary "+ lnUsername,
                min, max, 0, lnUsername);
        log.info("LN address created: {}", lnAddress);
        lightningMap.put("lnAddressUrl", lnAddress.lnurl());
        lightningMap.put("lnAddressUsername", lnAddress.username());

        return walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CONTRIBUTION)
                        .ownerReference(chamaMember.getUser().getUserReference())
                        .chama(chamaMember.getChama())
                        .lightning(lightningMap)
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



    public Page<ContributionCycle> findAllByChama(Pageable pageable, UUID chamaReference) {
        Chama chama = chamaRepository.getReferenceById(chamaReference);

        return cycleRepository.findAllByChama(pageable, chama);
    }

}
