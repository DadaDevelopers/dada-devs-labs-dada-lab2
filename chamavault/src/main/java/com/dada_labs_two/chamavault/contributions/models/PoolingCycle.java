package com.dada_labs_two.chamavault.contributions.models;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "pooling_cycles", indexes = {
        @Index(name = "idx_pooling_cycle_chama_status", columnList = "chama_reference,status")
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PoolingCycle {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;
    @ManyToOne(optional = false) @JoinColumn(name = "chama_reference")
    private Chama chama;
    @ManyToOne(optional = false) @JoinColumn(name = "wallet_reference")
    private Wallet wallet;
    @Column(nullable = false) private Integer sequenceNumber;
    @Column(nullable = false) private Long contributionAmount;
    @Column(nullable = false) private Long currentTotalContributionAmount;
    @Column(nullable = false) private Long expectedTotalContributionAmount;
    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private ContributionCycleStatus status;
    @Column(nullable = false) private ZonedDateTime startAt;
    @Column(nullable = false) private ZonedDateTime endAt;
    @CreationTimestamp private ZonedDateTime createdAt;
}
