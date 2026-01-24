package com.dada_labs_two.chamavault.contributions.models;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.contributions.constants.ContributionCycleStatus;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "contribution_cycles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class ContributionCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cycleReference;

    @ManyToOne
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    private Long contributionAmount = 0L;
    private Long currentTotalContributionAmount = 0L;
    private Long expectedTotalContributionAmount = 0L;

    @ManyToOne
    @JoinColumn(name = "wallet_reference")
    private Wallet wallet;

    @ManyToOne
    @JoinColumn(name = "beneficiary_user_reference")
    private ChamaMember beneficiaryUser;

    private Integer rotationIndex; // 1, 2, 3...

    @Enumerated(EnumType.STRING)
    private ContributionCycleStatus status;

    private ZonedDateTime startAt;
    private ZonedDateTime endAt;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;

    // field to track all contributor wallets
    @ManyToMany
    @JoinTable(
            name = "cycle_contributors",
            joinColumns = @JoinColumn(name = "cycle_reference"),
            inverseJoinColumns = @JoinColumn(name = "wallet_reference")
    )
    private List<Wallet> contributorWallets = new ArrayList<>();
}
