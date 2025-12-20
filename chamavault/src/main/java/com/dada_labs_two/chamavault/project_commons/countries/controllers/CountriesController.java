package com.dada_labs_two.chamavault.project_commons.countries.controllers;

import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.project_commons.countries.services.CountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@RestController
@RequestMapping("/api/commons/countries")
@RequiredArgsConstructor
public class CountriesController {
    private static final String COUNTRIES_PATH = "/{countryCode}";

    private final CountryService countryService;

    @PostMapping
    public HttpEntity<Countries> createCountries(@RequestBody Countries countries) {
        return new HttpEntity<>(countryService.addCountry(countries));
    }

    @DeleteMapping(COUNTRIES_PATH)
    public HttpEntity<String> deleteCountries(@PathVariable String countryCode) {
        countryService.deleteCountry(countryCode.toUpperCase());
        return new HttpEntity<>("Countries have been deleted");
    }

    @GetMapping
    public HttpEntity<Page<Countries>> getAllCountries(Pageable pageable) {
        return new HttpEntity<>(countryService.fetchAllCountries(pageable));
    }

    @GetMapping(COUNTRIES_PATH)
    public HttpEntity<Optional<Countries>> getCountryByCountryCode(@PathVariable String countryCode) {
        return new HttpEntity<>(countryService.findByCountryCode(countryCode.toUpperCase()));
    }

}
