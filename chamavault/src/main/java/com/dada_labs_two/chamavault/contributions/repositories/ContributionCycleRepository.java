package com.dada_labs_two.chamavault.contributions.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface ContributionCycleRepository extends JpaRepository<ContributionCycle, Integer> {
    int countByChama_ChamaReference(UUID chamaReference);

    List<ContributionCycle> findByStatusAndEndAtBefore(ContributionCycleStatus contributionCycleStatus, ZonedDateTime date);

    boolean existsByChamaAndStatus(Chama chama, ContributionCycleStatus contributionCycleStatus);

    Page<ContributionCycle> findAllByChama(Pageable pageable, Chama chama);
}
