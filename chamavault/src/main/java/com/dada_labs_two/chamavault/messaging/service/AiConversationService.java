package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.messaging.dtos.AiTool;
import com.dada_labs_two.chamavault.messaging.dtos.ChatResponse;
import com.dada_labs_two.chamavault.messaging.dtos.ToolCall;
import com.dada_labs_two.chamavault.messaging.dtos.ToolExecutionResult;
import com.dada_labs_two.chamavault.messaging.integrations.gemini.service.GeminiService;
import com.dada_labs_two.chamavault.messaging.models.Conversation;
import com.dada_labs_two.chamavault.messaging.models.ConversationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiConversationService {
    private final ConversationService conversationService;
    private final PromptBuilder promptBuilder;
    private final ToolRegistry toolRegistry;
    private final AiToolExecutor toolExecutor;
    private final GeminiService gemini;

    public ChatResponse chat(
            UUID userId,
            UUID conversationId,
            String message
    ) throws Exception {
        Conversation conversation;

        if (conversationId == null) {
            conversation = conversationService.createConversation(userId, "New chat");
        } else {
            conversation = conversationService.load(conversationId);
        }

        // 2. Save user message
        conversationService.saveUserMessage(conversation, message);

        // 3. Load history (last N messages to avoid token explosion)
        List<ConversationMessage> history =
                conversationService.loadRecentMessages(conversation.getConversationId(), 20);

        // 4. Build tool list
        List<AiTool> tools = toolRegistry.getTools();

        // 5. Build AI request payload
        String prompt = buildFullPrompt(history, message, tools);

        // 6. First AI call
        String response = gemini.getChatResponse(prompt);
        log.info("Gemini raw response:\n{}", response);

        // 7. TOOL LOOP (support multi-step reasoning)
        for (int i = 0; i < 3; i++) {

            ToolCall toolCall = tryParseToolCall(response);

            if (toolCall != null) {
                log.info("Tool name = {}", toolCall.getName());
                log.info("Arguments = {}", toolCall.getArguments());
            }

            if (toolCall == null) break;

            // Execute tool
            ToolExecutionResult toolResult =
                    executeTool(toolCall, userId);

            // Save tool message
            conversationService.saveToolMessage(
                    conversation,
                    toolCall.getName(),
                    toolCall.getArguments(),
                    toolResult.getJson()
            );

            // Rebuild prompt with tool result
            prompt = buildToolAugmentedPrompt(history, message, toolCall, toolResult, tools);

            response = gemini.getChatResponse(prompt);
        }

        // 8. Save assistant response
        conversationService.saveAssistantMessage(conversation, response);

        return ChatResponse.builder()
                .response(response)
                .conversationId(conversation.getConversationId())
                .build();

    }

    // -----------------------------
    // PROMPT BUILDING
    // -----------------------------

    private String buildFullPrompt(
            List<ConversationMessage> history,
            String userMessage,
            List<AiTool> tools
    ) {

        StringBuilder sb = new StringBuilder();

        sb.append(promptBuilder.buildSystemPrompt(tools)).append("\n\n");

        sb.append("Conversation history:\n");

        for (ConversationMessage msg : history) {
            sb.append(msg.getRole())
                    .append(": ")
                    .append(msg.getContent())
                    .append("\n");
        }

        sb.append("\nUser: ").append(userMessage);

        sb.append("\n\nIf you need data, respond ONLY in JSON tool format:\n");
        sb.append("""
        {
          "tool": "tool_name",
          "arguments": { }
        }
        """);

        sb.append("\nOtherwise respond normally.");

        return sb.toString();
    }

    private String buildToolAugmentedPrompt(
            List<ConversationMessage> history,
            String userMessage,
            ToolCall toolCall,
            ToolExecutionResult result,
            List<AiTool> tools
    ) {

        StringBuilder sb = new StringBuilder();

        sb.append(promptBuilder.buildSystemPrompt(tools)).append("\n\n");

        sb.append("User question: ").append(userMessage).append("\n\n");

        sb.append("Tool executed:\n")
                .append(toolCall.getName())
                .append("\nArguments: ")
                .append(toolCall.getArguments().toString())
                .append("\nResult: ")
                .append(result.getJson())
                .append("\n\n");

        sb.append("Now respond naturally to the user based on the tool result.");

        return sb.toString();
    }

    // -----------------------------
    // TOOL EXECUTION
    // -----------------------------

    private ToolExecutionResult executeTool(
            ToolCall toolCall,
            UUID userId
    ) throws Exception {

        JsonNode args = new ObjectMapper()
                .readTree(toolCall.getArguments());

        return toolExecutor.execute(
                toolCall.getName(),
                args,
                userId
        );
    }

    // -----------------------------
    // TOOL PARSING
    // -----------------------------

    private ToolCall tryParseToolCall(String response) {
        try {
            if (!response.trim().startsWith("{")) {
                return null;
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response);

            if (!node.has("tool")) {
                return null;
            }

            return ToolCall.builder()
                    .name(node.get("tool").asText())
                    .arguments(node.get("arguments").toString())
                    .build();

        } catch (Exception e) {
            return null;
        }
    }

}
