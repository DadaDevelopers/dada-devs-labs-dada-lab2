package com.dada_labs_two.chamavault.contributions.models;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.contributions.constants.*;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "member_contribution_obligations", uniqueConstraints = {
        @UniqueConstraint(name = "ux_member_merry_obligation", columnNames = {"user_reference", "contribution_cycle_reference"}),
        @UniqueConstraint(name = "ux_member_pooling_obligation", columnNames = {"user_reference", "pooling_cycle_reference"})
}, indexes = {@Index(name = "idx_obligation_chama_status", columnList = "chama_reference,status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MemberContributionObligation {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;
    @ManyToOne(optional = false) @JoinColumn(name = "chama_reference") private Chama chama;
    @ManyToOne(optional = false) @JoinColumn(name = "user_reference") private User member;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ContributionType type;
    @ManyToOne @JoinColumn(name = "contribution_cycle_reference") private ContributionCycle contributionCycle;
    @ManyToOne @JoinColumn(name = "pooling_cycle_reference") private PoolingCycle poolingCycle;
    @Column(nullable = false) private Long amountDueSats;
    @Column(nullable = false) private Long amountPaidSats;
    @Column(nullable = false) private ZonedDateTime dueAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ObligationStatus status;
    @CreationTimestamp private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    @PreUpdate public void updateTimestamp() { updatedAt = ZonedDateTime.now(); }
    public long outstandingAmountSats() { return Math.max(0L, amountDueSats - amountPaidSats); }
}
