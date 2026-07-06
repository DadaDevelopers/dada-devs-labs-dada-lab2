package com.dada_labs_two.chamavault.messaging.models;

import com.dada_labs_two.chamavault.messaging.constants.EngagingRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Table(name = "conversation_message")
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ConversationMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID conversationMessageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @Enumerated(value = EnumType.STRING)
    private EngagingRole role;

    @Column(columnDefinition = "text")
    private String content;

    /**
     * Optional: name of the tool invoked
     * e.g. "recommend_chamas"
     */
    private String toolName;

    /**
     * Raw JSON request sent to the tool.
     */
    @Column(columnDefinition = "TEXT")
    private String toolArguments;

    /**
     * Raw JSON returned by the tool.
     */
    @Column(columnDefinition = "TEXT")
    private String toolResult;

    @CreationTimestamp
    private ZonedDateTime createdAt;
}
