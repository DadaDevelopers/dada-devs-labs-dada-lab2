package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.chama.dtos.ChamaRecommendationRequest;
import com.dada_labs_two.chamavault.chama.services.ChamaService;
import com.dada_labs_two.chamavault.messaging.dtos.ToolExecutionResult;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiToolExecutor {
    private final ChamaService chamaService;
    private final ObjectMapper mapper;

    public ToolExecutionResult execute(String toolName, JsonNode arguments, UUID userId) {
        switch (toolName) {

            case "search_chamas" -> {
                int page = arguments.get("page").asInt();

                var result = chamaService.search_chamas(PageRequest.of(page,20));
                return ToolExecutionResult.builder()
                        .toolName(toolName)
                        .json(mapper.writeValueAsString(result))
                        .build();
            }

            case "get_chama" -> {
                UUID id = UUID.fromString(arguments.get("id").asText());
                var result =  chamaService.get_chama(id);

                return ToolExecutionResult.builder()
                        .toolName(toolName)
                        .json(mapper.writeValueAsString(result))
                        .build();
            }

            case "get_user_memberships" -> {
                var result = chamaService.get_user_memberships(userId);

                return ToolExecutionResult.builder()
                        .toolName(toolName)
                        .json(mapper.writeValueAsString(result))
                        .build();
            }

            case "recommend_chamas" -> {
                ChamaRecommendationRequest request =
                        mapper.treeToValue(
                                arguments,
                                ChamaRecommendationRequest.class);
                var result =
                        chamaService.recommendChamas(request);

                return ToolExecutionResult.builder()
                        .toolName(toolName)
                        .json(mapper.writeValueAsString(result))
                        .build();
            }

            default ->
                throw new RuntimeException("unknown tool");
        }
    }
}
