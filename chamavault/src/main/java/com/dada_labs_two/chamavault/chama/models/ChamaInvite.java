package com.dada_labs_two.chamavault.chama.models;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
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
@Table(name = "chama_invites")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class ChamaInvite {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID inviteReference;

    @ManyToOne
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    @ManyToOne
    @JoinColumn(name = "code")
    private Code inviteCode;

    @OneToMany
    @JoinColumn(name = "chama_member_reference")
    private List<ChamaMember> chamaMembers = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ChamaRole role; // Role this invite grants

    @Column(nullable = false)
    private Boolean requiresApproval;

    @Column(nullable = false)
    private Boolean used = false;

    @Column(nullable = false)
    private Boolean paused = false;

    private ZonedDateTime expiresAt;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
