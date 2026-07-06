package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.chama.dtos.ChamaRecommendationRequest;
import com.dada_labs_two.chamavault.chama.services.ChamaService;
import com.dada_labs_two.chamavault.messaging.dtos.ToolExecutionResult;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiToolExecutor {
    private final ChamaService chamaService;
    private final ObjectMapper mapper;

    public ToolExecutionResult execute(String toolName, JsonNode arguments, UUID userId) {
        switch (toolName) {

            case "search_chamas" -> {
                int page = arguments.has("page") ? arguments.get("page").asInt() : 0;

                var result = chamaService.search_chamas(PageRequest.of(page, 5));
                return ToolExecutionResult.builder()
                        .toolName(toolName)
                        .json(mapper.writeValueAsString(Map.of(
                                "page", result.getNumber(),
                                "totalPages", result.getTotalPages(),
                                "chamas", result.getContent().stream()
                                        .map(item -> {
                                            Map<String, Object> chama = new LinkedHashMap<>();
                                            chama.put("id", item.getChama().getChamaReference());
                                            chama.put("name", item.getChama().getName());
                                            chama.put("description", item.getChama().getDescription());
                                            chama.put("contributionAmount", item.getChama().getContributionAmount());
                                            chama.put("maxMembers", item.getChama().getMaxMembers());
                                            chama.put("frequency", item.getRules() != null ? item.getRules().getFrequency() : null);
                                            chama.put("requiresApproval", item.getRules() != null ? item.getRules().getRequiresApproval() : null);
                                            return chama;
                                        })
                                        .toList()
                        )))
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
                        .json(mapper.writeValueAsString(compactChamas(result)))
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

    private List<Map<String, Object>> compactChamas(
            List<com.dada_labs_two.chamavault.chama.dtos.stripped.ChamasDetailsDTO.ChamaDTO> chamas
    ) {
        return chamas.stream()
                .map(chama -> {
                    Map<String, Object> compact = new LinkedHashMap<>();
                    compact.put("id", chama.getChamaReference());
                    compact.put("name", chama.getName());
                    compact.put("description", chama.getDescription());
                    compact.put("contributionAmount", chama.getContributionAmount());
                    compact.put("maxMembers", chama.getMaxMembers());
                    return compact;
                })
                .toList();
    }
}
