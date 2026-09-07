package com.dada_labs_two.chamavault.governance.repositories;
import com.dada_labs_two.chamavault.governance.models.ChamaFine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ChamaFineRepository extends JpaRepository<ChamaFine, UUID> {}
