package com.dada_labs_two.chamavault.governance.models;

import com.dada_labs_two.chamavault.chama.models.*;
import com.dada_labs_two.chamavault.governance.constants.GovernanceRequestStatus;
import com.dada_labs_two.chamavault.governance.constants.GovernanceAction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import java.time.ZonedDateTime;
import java.util.*;

@Entity
@Table(name = "chama_governance_requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GovernanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne(optional = false)
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    @ManyToOne(optional = false)
    @JoinColumn(name = "maker_member_reference")
    private ChamaMember maker;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GovernanceAction action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private Map<String, String> parameters;

    private String reason;

    @Column(nullable = false)
    private Integer requiredApprovals;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GovernanceRequestStatus status;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime decidedAt;
}
