package com.dada_labs_two.chamavault.governance.models;

import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.governance.constants.CheckerDecision;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chama_governance_votes", uniqueConstraints =
        @UniqueConstraint(name = "uk_governance_request_checker", columnNames = {"request_reference", "checker_member_reference"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernanceVote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne(optional = false)
    @JoinColumn(name = "request_reference")
    private GovernanceRequest request;

    @ManyToOne(optional = false)
    @JoinColumn(name = "checker_member_reference")
    private ChamaMember checker;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CheckerDecision decision;

    private String comment;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
