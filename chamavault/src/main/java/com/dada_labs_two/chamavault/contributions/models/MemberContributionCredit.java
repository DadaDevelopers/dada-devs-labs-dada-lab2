package com.dada_labs_two.chamavault.contributions.models;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.contributions.constants.*;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;
@Entity @Table(name="member_contribution_credits",indexes={
 @Index(name="idx_credit_member_type",columnList="chama_reference,user_reference,contribution_type,status")})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class MemberContributionCredit {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID reference;
 @ManyToOne(optional=false) @JoinColumn(name="chama_reference") private Chama chama;
 @ManyToOne(optional=false) @JoinColumn(name="user_reference") private User member;
 @Enumerated(EnumType.STRING) @Column(name="contribution_type",nullable=false) private ContributionType contributionType;
 @Column(nullable=false) private Long originalAmountSats;
 @Column(nullable=false) private Long remainingAmountSats;
 @ManyToOne(optional=false) @JoinColumn(name="source_payment_reference") private ObligationPayment sourcePayment;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private ContributionCreditStatus status;
 @CreationTimestamp private ZonedDateTime createdAt;
 private ZonedDateTime updatedAt;
 @PreUpdate void updated(){updatedAt=ZonedDateTime.now();}
}
