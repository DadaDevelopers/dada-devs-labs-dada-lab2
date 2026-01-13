package com.dada_labs_two.chamavault.wallets.models;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID walletReference;

    @Enumerated(EnumType.STRING)
    private WalletType walletType;

    private UUID ownerReference; // Chama OR User

    @ManyToOne
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    @Column(nullable = false)
    private Long balanceSats = 0L;

    @Column(nullable = false)
    private Boolean active = true;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> lightning = new HashMap<>();

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
