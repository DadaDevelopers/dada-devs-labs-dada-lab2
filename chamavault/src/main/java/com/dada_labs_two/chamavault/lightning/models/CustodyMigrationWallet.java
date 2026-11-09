package com.dada_labs_two.chamavault.lightning.models;

import com.dada_labs_two.chamavault.wallets.models.Wallet;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "custody_migration_wallets", uniqueConstraints =
        @UniqueConstraint(name = "uk_migration_wallet", columnNames = {"migration_reference", "wallet_reference"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CustodyMigrationWallet {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "migration_reference", nullable = false)
    private CustodyMigration migration;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_reference", nullable = false)
    private Wallet wallet;

    @Column(nullable = false)
    private Long snapshotBalanceSats;
    private UUID sourceBindingReference;
    private UUID destinationBindingReference;
}
