package com.dada_labs_two.chamavault.messaging.models;

import com.dada_labs_two.chamavault.messaging.constants.DeliveryMode;
import com.dada_labs_two.chamavault.messaging.constants.MessageChannel;
import com.dada_labs_two.chamavault.messaging.constants.MessageType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;

import java.time.ZonedDateTime;
import java.util.UUID;

@Table (name = "messages")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
@SQLRestriction("deleted_at is null")
public class Messages {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String source;

    private String recipient;

    @Enumerated(value = EnumType.STRING)
    private DeliveryMode deliveryMode;

    @Enumerated(value = EnumType.STRING)
    private MessageChannel channel;

    @Enumerated(value = EnumType.STRING)
    private MessageType type;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    private ZonedDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
}
