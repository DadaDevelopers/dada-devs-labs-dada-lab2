package com.dada_labs_two.chamavault.chama.models;

import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import com.dada_labs_two.chamavault.contributions.constants.ContributionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chama_rules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class ChamaRules {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    private Boolean requiresApproval;
    private Long contributionAmount = 0L;

    private Integer requiredApprovals;

    private Long dailyLimitSats;

    @Enumerated(EnumType.STRING)
    private ContributionFrequency frequency;

    private Boolean poolingEnabled;
    private Long poolingContributionAmount;
    @Enumerated(EnumType.STRING)
    private ContributionFrequency poolingFrequency;
    private Long poolingTargetAmountSats;
    private Boolean poolingRequiresApproval;
    private Integer poolingRequiredApprovals;

    private Boolean merryGoRoundEnabled;
    private Long merryGoRoundContributionAmount;
    @Enumerated(EnumType.STRING)
    private ContributionFrequency merryGoRoundFrequency;
    private Boolean beneficiaryContributes;

    public long effectivePoolingAmount() {
        return poolingContributionAmount == null ? contributionAmount : poolingContributionAmount;
    }
    public ContributionFrequency effectivePoolingFrequency() {
        return poolingFrequency == null ? frequency : poolingFrequency;
    }
    public long effectiveMerryGoRoundAmount() {
        return merryGoRoundContributionAmount == null ? contributionAmount : merryGoRoundContributionAmount;
    }
    public ContributionFrequency effectiveMerryGoRoundFrequency() {
        return merryGoRoundFrequency == null ? frequency : merryGoRoundFrequency;
    }
    public boolean doesBeneficiaryContribute() { return Boolean.TRUE.equals(beneficiaryContributes); }

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
