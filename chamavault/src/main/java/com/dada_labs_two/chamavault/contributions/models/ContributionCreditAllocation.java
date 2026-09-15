package com.dada_labs_two.chamavault.contributions.models;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;
@Entity @Table(name="contribution_credit_allocations",uniqueConstraints=
 @UniqueConstraint(name="ux_credit_obligation_allocation",columnNames={"credit_reference","obligation_reference"}))
@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class ContributionCreditAllocation {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID reference;
 @ManyToOne(optional=false) @JoinColumn(name="credit_reference") private MemberContributionCredit credit;
 @ManyToOne(optional=false) @JoinColumn(name="obligation_reference") private MemberContributionObligation obligation;
 @Column(nullable=false) private Long amountSats;
 @CreationTimestamp private ZonedDateTime allocatedAt;
}
