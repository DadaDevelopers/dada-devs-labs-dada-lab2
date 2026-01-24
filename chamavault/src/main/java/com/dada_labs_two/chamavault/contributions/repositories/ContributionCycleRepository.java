package com.dada_labs_two.chamavault.contributions.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContributionCycleRepository extends JpaRepository<ContributionCycle, Integer> {
    int countByChama_ChamaReference(UUID chamaReference);

    List<ContributionCycle> findByStatusAndEndAtBefore(ContributionCycleStatus contributionCycleStatus, ZonedDateTime date);

    boolean existsByChamaAndStatus(Chama chama, ContributionCycleStatus contributionCycleStatus);

    Page<ContributionCycle> findAllByChama(Pageable pageable, Chama chama);

    Optional<ContributionCycle> findByBeneficiaryUserAndWalletAndChama(ChamaMember beneficiaryUser,
                                                               Wallet wallet,
                                                               Chama chama);

    Optional<ContributionCycle> findByWalletAndStatus(Wallet contributionWallet, ContributionCycleStatus contributionCycleStatus);
}
