package com.dada_labs_two.chamavault.contributions.models;

import com.dada_labs_two.chamavault.contributions.constants.ContributionStatus;
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

@Entity
@Table(name = "contributions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class Contribution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contributionReference;

    @ManyToOne
    @JoinColumn(name = "cycle_reference")
    private ContributionCycle contributionCycle;

    @ManyToOne
    @JoinColumn(name = "user_reference")
    private User user;

    private Long amountSats;

    @Enumerated(EnumType.STRING)
    private ContributionStatus status;

    @CreationTimestamp
    private ZonedDateTime contributedAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;
}
