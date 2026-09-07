package com.dada_labs_two.chamavault.governance.repositories;
import com.dada_labs_two.chamavault.governance.constants.CheckerDecision;
import com.dada_labs_two.chamavault.governance.models.GovernanceRequest;
import com.dada_labs_two.chamavault.governance.models.GovernanceVote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface GovernanceVoteRepository extends JpaRepository<GovernanceVote, UUID> {
 boolean existsByRequestAndChecker(GovernanceRequest request, com.dada_labs_two.chamavault.chama.models.ChamaMember checker);
 long countByRequestAndDecision(GovernanceRequest request, CheckerDecision decision);
}
