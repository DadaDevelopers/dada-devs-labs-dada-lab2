package com.dada_labs_two.chamavault.contributions.repositories;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.PoolingCycle;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.ZonedDateTime;
import java.util.*;
public interface PoolingCycleRepository extends JpaRepository<PoolingCycle, UUID> {
 Optional<PoolingCycle> findByChama_ChamaReferenceAndStatus(UUID chamaReference, ContributionCycleStatus status);
 Optional<PoolingCycle> findByChama_ChamaReferenceAndWallet_WalletReferenceAndStatus(UUID chamaReference,UUID walletReference,ContributionCycleStatus status);
 List<PoolingCycle> findByStatusAndEndAtBefore(ContributionCycleStatus status, ZonedDateTime endAt);
 Page<PoolingCycle> findByChama_ChamaReference(UUID chamaReference, Pageable pageable);
 int countByChama_ChamaReference(UUID chamaReference);
}
