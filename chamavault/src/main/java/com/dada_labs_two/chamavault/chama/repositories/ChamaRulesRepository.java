package com.dada_labs_two.chamavault.chama.repositories;

import com.dada_labs_two.chamavault.chama.models.ChamaRules;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChamaRulesRepository extends JpaRepository<ChamaRules, UUID> {
}
