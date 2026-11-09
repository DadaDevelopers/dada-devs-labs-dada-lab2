package com.dada_labs_two.chamavault.lightning.models;

import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.*;

@Entity
@Table(name = "wallet_provider_bindings", indexes = {
        @Index(name = "idx_wallet_provider_binding_wallet", columnList = "wallet_reference"),
        @Index(name = "idx_wallet_provider_binding_active", columnList = "active")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WalletProviderBinding {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID bindingReference;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_reference", nullable = false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LightningProviderType provider;

    private String providerWalletReference;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    @Builder.Default
    private Map<String, String> providerMetadata = new HashMap<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    private ZonedDateTime activatedAt;
    private ZonedDateTime deactivatedAt;
}
