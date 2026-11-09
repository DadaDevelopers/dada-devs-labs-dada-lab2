package com.dada_labs_two.chamavault.lightning.models;

import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "lightning_provider_config")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LightningProviderConfig {
    @Id
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LightningProviderType activeProvider;

    private UUID updatedBy;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;
}
