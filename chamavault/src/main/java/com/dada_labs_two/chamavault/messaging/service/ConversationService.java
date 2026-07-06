package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.messaging.constants.EngagingRole;
import com.dada_labs_two.chamavault.messaging.models.Conversation;
import com.dada_labs_two.chamavault.messaging.models.ConversationMessage;
import com.dada_labs_two.chamavault.messaging.repositories.ConversationMessageRepository;
import com.dada_labs_two.chamavault.messaging.repositories.ConversationRepository;
import com.dada_labs_two.chamavault.messaging.repositories.MessagesRepository;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository conversationMessageRepository;

    public Conversation createConversation(UUID userId, String title) {
        return conversationRepository.save(Conversation.builder()
                        .user(User.builder().userReference(userId).build())
                        .title(title)
                .build());
    }

    public List<ConversationMessage> loadRecentMessages(UUID conversationId, int limit) {
        List<ConversationMessage> messages = new ArrayList<>(
                conversationMessageRepository.findByConversation_ConversationIdAndRoleNotOrderByCreatedAtDesc(
                        conversationId,
                        EngagingRole.TOOL,
                        PageRequest.of(0, limit)
                )
        );
        Collections.reverse(messages);
        return messages;
    }

    public Conversation load(UUID conversationId) {
        return conversationRepository.findById(conversationId).orElseThrow();
    }

    public void saveToolMessage(
            Conversation conversation,
            String toolName,
            String arguments,
            String result
    ) {
        conversationMessageRepository.save(
                ConversationMessage.builder()
                        .conversation(conversation)
                        .role(EngagingRole.TOOL)
                        .toolName(toolName)
                        .toolArguments(arguments)
                        .toolResult(result)
                        .content("Tool " + toolName + " executed.")
                        .build()
        );
    }

    public void saveUserMessage(Conversation conversation, String text) {
        conversationMessageRepository.save(
                ConversationMessage.builder()
                        .conversation(conversation)
                        .role(EngagingRole.USER)
                        .content(text)
                        .build()
        );
    }

    public void saveAssistantMessage(
            Conversation conversation,
            String text){

        conversationMessageRepository.save(
                ConversationMessage.builder()
                        .conversation(conversation)
                        .role(EngagingRole.ASSISTANT)
                        .content(text)
                        .build()
        );

    }
}
