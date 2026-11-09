package com.dada_labs_two.chamavault.lightning.repositories;

import com.dada_labs_two.chamavault.lightning.models.LightningProviderConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LightningProviderConfigRepository extends JpaRepository<LightningProviderConfig, Integer> {
}
