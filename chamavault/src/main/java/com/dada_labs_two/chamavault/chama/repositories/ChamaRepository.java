package com.dada_labs_two.chamavault.chama.repositories;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.models.Chama;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChamaRepository extends JpaRepository<Chama, UUID> {
    Page<Chama> findAllByVisibility(Pageable pageable, ChamaVisibility visibility);
}
