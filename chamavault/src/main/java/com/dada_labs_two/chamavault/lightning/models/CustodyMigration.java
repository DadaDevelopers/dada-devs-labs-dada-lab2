package com.dada_labs_two.chamavault.lightning.models;

import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import com.dada_labs_two.chamavault.lightning.constants.CustodyMigrationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.*;

@Entity
@Table(name = "custody_migrations")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CustodyMigration {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID migrationReference;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private LightningProviderType sourceProvider;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private LightningProviderType destinationProvider;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private CustodyMigrationStatus status;

    @Column(nullable = false)
    private Long expectedSats;
    private Long fundedSats;
    private String fundingPaymentHash;
    @Column(length = 4096)
    private String fundingInvoice;
    private UUID initiatedBy;
    private String failureReason;

    @OneToMany(mappedBy = "migration", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustodyMigrationWallet> wallets = new ArrayList<>();

    @CreationTimestamp private ZonedDateTime createdAt;
    @UpdateTimestamp private ZonedDateTime updatedAt;
    private ZonedDateTime completedAt;
}
