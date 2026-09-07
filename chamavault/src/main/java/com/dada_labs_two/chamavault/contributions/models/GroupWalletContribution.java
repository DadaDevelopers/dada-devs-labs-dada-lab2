package com.dada_labs_two.chamavault.contributions.models;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_wallet_contributions", indexes = {
        @Index(name = "idx_group_contribution_wallet", columnList = "wallet_reference"),
        @Index(name = "idx_group_contribution_chama", columnList = "chama_reference")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class GroupWalletContribution {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne(optional = false)
    @JoinColumn(name = "chama_reference")
    private Chama chama;
    @ManyToOne @JoinColumn(name = "pooling_cycle_reference")
    private PoolingCycle poolingCycle;

    @ManyToOne(optional = false)
    @JoinColumn(name = "wallet_reference")
    private Wallet wallet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_reference")
    private User contributor;

    @Column(nullable = false)
    private Long amountSats;
    private Long platformFeeSats;

    private UUID feeRuleReference;
    private String feePaymentReference;

    private String externalReference;

    @CreationTimestamp
    private ZonedDateTime contributedAt;
}
