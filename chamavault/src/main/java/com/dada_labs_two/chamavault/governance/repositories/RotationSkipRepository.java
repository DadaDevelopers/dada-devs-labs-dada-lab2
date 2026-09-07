package com.dada_labs_two.chamavault.governance.repositories;
import com.dada_labs_two.chamavault.governance.models.RotationSkip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RotationSkipRepository extends JpaRepository<RotationSkip, UUID> {
    Optional<RotationSkip> findFirstByChama_ChamaReferenceAndMember_ReferenceAndConsumedAtIsNullOrderByCreatedAtAsc(UUID chamaId, UUID memberId);
    boolean existsByChama_ChamaReferenceAndMember_ReferenceAndConsumedAtIsNull(UUID chamaId, UUID memberId);
}
