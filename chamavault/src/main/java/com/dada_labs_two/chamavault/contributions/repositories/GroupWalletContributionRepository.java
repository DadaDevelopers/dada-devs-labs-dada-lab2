package com.dada_labs_two.chamavault.contributions.repositories;

import com.dada_labs_two.chamavault.contributions.models.GroupWalletContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface GroupWalletContributionRepository extends JpaRepository<GroupWalletContribution, UUID> {
}
