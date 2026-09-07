package com.dada_labs_two.chamavault.chama.models;

import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.constants.ChamaPurpose;
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
@Table(name = "chamas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class Chama {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID chamaReference;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    private Long contributionAmount = 0L;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(32) default 'MERRY_GO_ROUND'")
    private ChamaPurpose purpose = ChamaPurpose.MERRY_GO_ROUND;

    private String iconUrl;

    @Enumerated(EnumType.STRING)
    private ChamaVisibility visibility; // PUBLIC / PRIVATE

    @Column(nullable = false)
    private Integer maxMembers;

    @Column(nullable = false)
    private Integer currentRotationIndex = 0;

    private ZonedDateTime merryGoRoundWaitingNotifiedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User createdBy;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;

    public ChamaPurpose getPurpose() {
        return purpose == null ? ChamaPurpose.MERRY_GO_ROUND : purpose;
    }
}
