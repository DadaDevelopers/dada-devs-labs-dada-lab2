package com.dada_labs_two.chamavault.wallets.models;

import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import com.dada_labs_two.chamavault.wallets.constants.TransactionSource;
import com.dada_labs_two.chamavault.wallets.constants.TransactionType;
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
@Table(
        name = "transactions",
        indexes = {
                @Index(columnList = "walletReference"),
                @Index(columnList = "rotationIndex"),
                @Index(columnList = "externalRef")
        }
)@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID transactionReference;

    @ManyToOne(optional = false)
    @JoinColumn(name = "wallet_reference")
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    private TransactionSource source;

    @Enumerated(EnumType.STRING)
    private TransactionCategory category;

    private Long amountSats;
    private Long feeSats = 0L;

    // LNbits payment_hash or internal transfer id
    @Column(unique = true)
    private String externalRef;

    // Who initiated (user, system)
    private UUID initiatedBy;

    // Who actually paid (if known)
    private UUID counterpartyUser;

    // Rotation info
    private Integer rotationIndex;

    private String memo;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> metadata = new HashMap<>();

    private ZonedDateTime occurredAt;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
