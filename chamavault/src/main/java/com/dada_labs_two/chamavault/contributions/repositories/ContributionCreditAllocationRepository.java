package com.dada_labs_two.chamavault.contributions.repositories;
import com.dada_labs_two.chamavault.contributions.models.ContributionCreditAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
public interface ContributionCreditAllocationRepository extends JpaRepository<ContributionCreditAllocation,UUID>{}
