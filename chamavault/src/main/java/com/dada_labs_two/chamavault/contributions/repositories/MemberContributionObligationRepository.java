package com.dada_labs_two.chamavault.contributions.repositories;

import com.dada_labs_two.chamavault.contributions.constants.ObligationStatus;
import com.dada_labs_two.chamavault.contributions.models.MemberContributionObligation;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.*;

public interface MemberContributionObligationRepository extends JpaRepository<MemberContributionObligation, UUID> {
    boolean existsByMember_UserReferenceAndContributionCycle_CycleReference(UUID userReference, Integer cycleReference);
    boolean existsByMember_UserReferenceAndPoolingCycle_Reference(UUID userReference, UUID cycleReference);
    Page<MemberContributionObligation> findByChama_ChamaReference(UUID chamaReference, Pageable pageable);
    Page<MemberContributionObligation> findByChama_ChamaReferenceAndMember_UserReference(UUID chamaReference, UUID userReference, Pageable pageable);
    Page<MemberContributionObligation> findByChama_ChamaReferenceAndStatus(UUID chamaReference, ObligationStatus status, Pageable pageable);
    Page<MemberContributionObligation> findByChama_ChamaReferenceAndMember_UserReferenceAndStatus(UUID chamaReference, UUID userReference, ObligationStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from MemberContributionObligation o where o.reference=:reference")
    Optional<MemberContributionObligation> findForUpdate(@Param("reference") UUID reference);
}
