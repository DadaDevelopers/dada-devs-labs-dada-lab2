package com.dada_labs_two.chamavault.fees.models;

import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "fee_rules", indexes = @Index(name = "idx_fee_rule_lookup", columnList = "category,active,effective_from"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionCategory category;

    @Column(nullable = false, precision = 8, scale = 5)
    private BigDecimal percentage;

    private Long minimumFeeSats;
    private Long maximumFeeSats;

    @Column(name = "effective_from", nullable = false)
    private ZonedDateTime effectiveFrom;
    private ZonedDateTime effectiveUntil;

    @Column(nullable = false)
    private Boolean active;

    @Column(nullable = false)
    private UUID createdBy;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
