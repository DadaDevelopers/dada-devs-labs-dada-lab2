package com.dada_labs_two.chamavault.chama.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chama_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class ChamaRules {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    private Boolean requiresApproval;

    private Integer requiredApprovals;

    private Long dailyLimitSats;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
