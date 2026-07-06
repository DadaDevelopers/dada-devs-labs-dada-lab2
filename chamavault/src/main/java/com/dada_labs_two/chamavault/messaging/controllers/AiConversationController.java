package com.dada_labs_two.chamavault.messaging.controllers;

import com.dada_labs_two.chamavault.messaging.dtos.ChatRequest;
import com.dada_labs_two.chamavault.messaging.dtos.ChatResponse;
import com.dada_labs_two.chamavault.messaging.service.AiConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/messaging/chama-chat-ai")
@RequiredArgsConstructor
public class AiConversationController {
    private final AiConversationService aiConversationService;

    @PostMapping("/chat")
    public ChatResponse chat(
            @RequestHeader("X-USER_ID")UUID userId,
            @RequestBody ChatRequest request
            ) throws Exception {
        return aiConversationService.chat(
                userId,
                request.getConversationId(),
                request.getMessage()
        );
    }
}
