package com.dada_labs_two.chamavault.users.models;

import com.dada_labs_two.chamavault.users.constants.Activity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Data
@Builder
@Entity
@Table(name = "profile_actions")
@NoArgsConstructor
@AllArgsConstructor
public class ProfileActions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userAccount;

    @Column(nullable = false)
    private String action;

    @Enumerated(value = EnumType.STRING)
    private Activity activity;

    private String description;
    private String reason;

    @Column(columnDefinition = "integer DEFAULT 0")
    private Integer count = 0;

    private String comment;

    private ZonedDateTime deadline;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime lastPerformedAt;
}
