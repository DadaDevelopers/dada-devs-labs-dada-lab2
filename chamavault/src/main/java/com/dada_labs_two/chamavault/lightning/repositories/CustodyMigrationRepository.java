package com.dada_labs_two.chamavault.lightning.repositories;

import com.dada_labs_two.chamavault.lightning.models.CustodyMigration;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;

import java.util.*;

public interface CustodyMigrationRepository extends JpaRepository<CustodyMigration, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select distinct m from CustodyMigration m left join fetch m.wallets where m.migrationReference=:reference")
    Optional<CustodyMigration> findByIdForUpdate(UUID reference);
}
