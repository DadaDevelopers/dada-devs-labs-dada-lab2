package com.dada_labs_two.chamavault.contributions.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity @Table(name = "obligation_payments")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ObligationPayment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID reference;
    @ManyToOne(optional = false) @JoinColumn(name = "obligation_reference") private MemberContributionObligation obligation;
    @Column(nullable = false) private Long amountSats;
    private Long platformFeeSats;
    private UUID feeRuleReference;
    private String paymentReference;
    private String feePaymentReference;
    @CreationTimestamp private ZonedDateTime paidAt;
}
