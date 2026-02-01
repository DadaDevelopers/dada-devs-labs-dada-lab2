package com.dada_labs_two.chamavault.contributions.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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


    @Query("""
    SELECT cc
    FROM ContributionCycle cc
    JOIN cc.chama c
    JOIN ChamaMember cm ON cm.chama = c
    WHERE cm.user.userReference = :userRef
      AND cm.status = 'ACTIVE'
      AND cc.startAt >= cm.joinedAt
      AND cc.status IN :statuses
      AND NOT EXISTS (
          SELECT w
          FROM cc.contributorWallets w
          WHERE w.ownerReference = :userRef
      )
    """)
    List<ContributionCycle> findUnpaidCyclesForUser(
            @Param("userRef") UUID userRef,
            @Param("statuses") List<ContributionCycleStatus> statuses
    );

}
