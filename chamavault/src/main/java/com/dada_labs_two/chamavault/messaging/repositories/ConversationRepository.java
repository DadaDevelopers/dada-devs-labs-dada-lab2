package com.dada_labs_two.chamavault.messaging.repositories;

import com.dada_labs_two.chamavault.messaging.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
}
