package com.dada_labs_two.chamavault.chama.models;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "chama_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class ChamaMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID reference;

    @ManyToOne
    @JoinColumn(name = "chama_reference")
    private Chama chama;

    @ManyToOne
    @JoinColumn(name = "user_reference")
    private User user;

    @Enumerated(EnumType.STRING)
    private ChamaRole role;

    @Enumerated(EnumType.STRING)
    private MembershipStatus status; // ACTIVE / PENDING / REJECTED

    @CreationTimestamp
    private ZonedDateTime joinedAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
