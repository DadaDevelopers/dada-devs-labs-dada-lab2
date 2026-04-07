package com.dada_labs_two.chamavault.payments.models;

import com.dada_labs_two.chamavault.payments.constants.*;
import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.wallets.constants.Network;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@Entity
@Table(name = "payments")
@SQLRestriction("deleted_at is null")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID paymentId;

    @Column(precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private String description;

    @Enumerated(value = EnumType.STRING)
    private PaymentMode mode;

    @Enumerated(value = EnumType.STRING)
    private PaymentProvider provider;

    @Enumerated(value = EnumType.STRING)
    private PaymentCategory category;

    @Enumerated(EnumType.STRING)
    private Network walletAffiliatedNetwork;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iso_code")
    private Countries country;

    @Enumerated(value = EnumType.STRING)
    private Currencies currency;

    @Enumerated(value = EnumType.STRING)
    private TransactionStatus transactionStatus;

    private String paymentProviderReference;
    private String providerDescription;
    private String receiptNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> metadata = new HashMap<>();

    @CreationTimestamp
    private ZonedDateTime createdAt;

    private String createdBy;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private String updatedBy;

    private ZonedDateTime deletedAt;
}
