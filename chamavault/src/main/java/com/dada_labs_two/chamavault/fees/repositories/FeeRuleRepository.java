package com.dada_labs_two.chamavault.fees.repositories;

import com.dada_labs_two.chamavault.fees.models.FeeRule;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.*;

public interface FeeRuleRepository extends JpaRepository<FeeRule, UUID> {
    @Query("select f from FeeRule f where f.category=:category and f.active=true and f.effectiveFrom<=:at and (f.effectiveUntil is null or f.effectiveUntil>:at) order by f.effectiveFrom desc")
    List<FeeRule> findEffective(@Param("category") TransactionCategory category, @Param("at") ZonedDateTime at);

    List<FeeRule> findByCategoryOrderByEffectiveFromDesc(TransactionCategory category);
}
