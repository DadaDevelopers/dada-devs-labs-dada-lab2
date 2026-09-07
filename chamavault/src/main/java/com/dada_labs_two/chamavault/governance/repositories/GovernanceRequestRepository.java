package com.dada_labs_two.chamavault.governance.repositories;
import com.dada_labs_two.chamavault.governance.models.GovernanceRequest;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface GovernanceRequestRepository extends JpaRepository<GovernanceRequest, UUID> {
 Page<GovernanceRequest> findByChama_ChamaReference(UUID chamaReference, Pageable pageable);
}
