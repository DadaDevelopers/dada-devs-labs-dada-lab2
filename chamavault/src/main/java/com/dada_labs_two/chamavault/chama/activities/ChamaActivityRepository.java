package com.dada_labs_two.chamavault.chama.activities;
import org.springframework.data.jpa.repository.*;
import java.util.*;
public interface ChamaActivityRepository extends JpaRepository<ChamaActivity,UUID>, JpaSpecificationExecutor<ChamaActivity> {
 Optional<ChamaActivity> findByEventKey(String eventKey);
}
