package com.dada_labs_two.chamavault.contributions.repositories;

import com.dada_labs_two.chamavault.contributions.models.GroupWalletContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface GroupWalletContributionRepository extends JpaRepository<GroupWalletContribution, UUID> {
    long countByPoolingCycleAndContributor_UserReference(
            com.dada_labs_two.chamavault.contributions.models.PoolingCycle poolingCycle, UUID userReference);
    @org.springframework.data.jpa.repository.Query("select coalesce(sum(c.amountSats),0) from GroupWalletContribution c where c.poolingCycle=:cycle and c.contributor.userReference=:userReference")
    long sumForMemberInCycle(@org.springframework.data.repository.query.Param("cycle") com.dada_labs_two.chamavault.contributions.models.PoolingCycle cycle,
                             @org.springframework.data.repository.query.Param("userReference") UUID userReference);
}
