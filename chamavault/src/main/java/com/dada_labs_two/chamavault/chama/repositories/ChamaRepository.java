package com.dada_labs_two.chamavault.chama.repositories;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.models.Chama;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface ChamaRepository extends JpaRepository<Chama, UUID> {
    Page<Chama> findAllByVisibility(Pageable pageable, ChamaVisibility visibility);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Chama c where c.chamaReference = :ref")
    Optional<Chama> findByReferenceForUpdate(UUID ref);

}
