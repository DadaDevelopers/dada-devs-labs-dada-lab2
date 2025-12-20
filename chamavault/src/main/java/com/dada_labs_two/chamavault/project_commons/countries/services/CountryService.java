package com.dada_labs_two.chamavault.project_commons.countries.services;

import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.project_commons.countries.repositories.CountriesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CountryService {
    private final CountriesRepository countriesRepository;

    public Optional<Countries> findByCountryCode(String countryCode) {
        return countriesRepository.findById(countryCode);
    }

    public Optional<Countries> findByCountryName(String countryName) {
        return countriesRepository.findByCountryName(countryName);
    }

    public Countries addCountry(Countries countries) {
        Optional<Countries> country = findByCountryCode(countries.getIsoCode().toUpperCase());
        return country.orElseGet(() -> countriesRepository.save(countries));
    }

    public Countries updateCountry(Countries countries) {
        return countriesRepository.save(countries);
    }

    public void deleteCountry(String countryCode) {
        countriesRepository.deleteById(countryCode);
    }

    public Page<Countries> fetchAllCountries(Pageable pageable) {
        return countriesRepository.findAll(pageable);
    }
}
