package com.dada_labs_two.chamavault.messaging.repositories;

import com.dada_labs_two.chamavault.messaging.models.ConversationMessage;
import com.dada_labs_two.chamavault.messaging.constants.EngagingRole;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, UUID> {
    List<ConversationMessage> findTop20ByConversation_ConversationIdOrderByCreatedAtDesc(UUID conversationId);
    List<ConversationMessage> findByConversation_ConversationIdAndRoleNotOrderByCreatedAtDesc(
            UUID conversationId,
            EngagingRole role,
            Pageable pageable
    );

}
