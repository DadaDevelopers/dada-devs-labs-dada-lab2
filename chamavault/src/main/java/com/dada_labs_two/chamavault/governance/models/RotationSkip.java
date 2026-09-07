package com.dada_labs_two.chamavault.governance.models;

import com.dada_labs_two.chamavault.chama.models.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity @Table(name = "chama_rotation_skips", indexes =
        @Index(name = "idx_rotation_skip_pending", columnList = "chama_reference,consumed_at"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RotationSkip {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID reference;
    @ManyToOne(optional = false) @JoinColumn(name = "chama_reference") private Chama chama;
    @ManyToOne(optional = false) @JoinColumn(name = "member_reference") private ChamaMember member;
    @ManyToOne(optional = false) @JoinColumn(name = "governance_request_reference") private GovernanceRequest governanceRequest;
    @CreationTimestamp private ZonedDateTime createdAt;
    private ZonedDateTime consumedAt;
}
