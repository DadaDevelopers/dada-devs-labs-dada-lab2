package com.dada_labs_two.chamavault.contributions.services;

import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.repositories.ContributionCycleRepository;
import com.dada_labs_two.chamavault.contributions.repositories.PoolingCycleRepository;
import com.dada_labs_two.chamavault.contributions.repositories.GroupWalletContributionRepository;
import com.dada_labs_two.chamavault.contributions.models.PoolingCycle;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor
public class ContributionReminderService {
    private final ContributionCycleRepository cycleRepository;
    private final ChamaMemberRepository memberRepository;
    private final ProfileActionService notifications;
    private final PoolingCycleRepository poolingCycleRepository;
    private final GroupWalletContributionRepository groupContributionRepository;
    @Value("${chama.reminders.hours-before-due:24}") private long hoursBeforeDue;

    @Scheduled(cron = "${chama.reminders.cron:0 0 8 * * *}")
    public void remindOutstandingContributors() {
        ZonedDateTime cutoff = ZonedDateTime.now().plusHours(hoursBeforeDue);
        for (ContributionCycle cycle : cycleRepository.findByStatus(ContributionCycleStatus.ACTIVE)) {
            if (cycle.getEndAt() == null || cycle.getEndAt().isAfter(cutoff)) continue;
            Set<UUID> paid = cycle.getContributorWallets().stream().map(w -> w.getOwnerReference()).collect(Collectors.toSet());
            for (ChamaMember member : memberRepository.findMembersByChamaAndStatus(
                    cycle.getChama().getChamaReference(), MembershipStatus.ACTIVE)) {
                if (!paid.contains(member.getUser().getUserReference())) {
                    notifications.notifyContributionReminder(member.getUser(), cycle);
                }
            }
        }
        for (PoolingCycle cycle : poolingCycleRepository.findByStatusAndEndAtBefore(
                ContributionCycleStatus.ACTIVE, cutoff)) {
            for (ChamaMember member : memberRepository.findMembersByChamaAndStatus(
                    cycle.getChama().getChamaReference(), MembershipStatus.ACTIVE)) {
                long contributed = groupContributionRepository.sumForMemberInCycle(
                        cycle, member.getUser().getUserReference());
                if (contributed < cycle.getContributionAmount()) {
                    notifications.notifyPoolingContributionDue(member.getUser(), cycle);
                }
            }
        }
    }
}
