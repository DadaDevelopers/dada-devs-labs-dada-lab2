package com.dada_labs_two.chamavault.messaging.models;

import com.dada_labs_two.chamavault.users.models.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;

import java.time.ZonedDateTime;
import java.util.UUID;

@Table(name = "conversation")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@SQLRestriction("deleted_at is null")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID conversationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_reference")
    private User user;

    private String title;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    private ZonedDateTime deletedAt;
}
