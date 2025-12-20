package com.dada_labs_two.chamavault.project_commons.countries.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

@Data
@Table(name = "countries")
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Countries {
    @Id
    private String isoCode;

    @Column(nullable = false)
    private String countryName;


    private String continent;

    private  String flagUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> extraData = new HashMap<>();

    @PrePersist
    public void onCreate() {
        this.isoCode = this.isoCode.toUpperCase().trim();
        this.countryName = this.countryName.toUpperCase();
        this.continent = this.continent.toUpperCase();
    }

    @PreUpdate
    public void onUpdate() {
        this.isoCode = this.isoCode.toUpperCase().trim();
        this.countryName = this.countryName.toUpperCase();
        this.continent = this.continent.toUpperCase();
    }
}
