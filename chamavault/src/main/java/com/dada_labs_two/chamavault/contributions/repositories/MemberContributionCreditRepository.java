package com.dada_labs_two.chamavault.contributions.repositories;
import com.dada_labs_two.chamavault.contributions.constants.*;
import com.dada_labs_two.chamavault.contributions.models.MemberContributionCredit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;
import org.springframework.data.domain.*;
public interface MemberContributionCreditRepository extends JpaRepository<MemberContributionCredit,UUID>{
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select c from MemberContributionCredit c where c.chama.chamaReference=:chamaId and c.member.userReference=:userId and c.contributionType=:type and c.status in :statuses order by c.createdAt asc")
 List<MemberContributionCredit> findAvailableForUpdate(@Param("chamaId") UUID chamaId,@Param("userId") UUID userId,
  @Param("type") ContributionType type,@Param("statuses") Collection<ContributionCreditStatus> statuses);
 Page<MemberContributionCredit> findByChama_ChamaReferenceAndMember_UserReferenceOrderByCreatedAtDesc(UUID chamaId,UUID userId,Pageable page);
}
