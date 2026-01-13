package com.dada_labs_two.chamavault.chama.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaRules;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChamaRulesRepository extends JpaRepository<ChamaRules, UUID> {
    Optional<ChamaRules> findByChama(Chama chama);
}
