package com.dada_labs_two.chamavault.project_commons.countries.repositories;

import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CountriesRepository extends JpaRepository<Countries, String>, JpaSpecificationExecutor<Countries> {
    Optional<Countries> findByCountryName(String countryName);
}
