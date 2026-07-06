package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.messaging.dtos.AiTool;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToolRegistry {
    public List<AiTool> getTools() {
        return  List.of(
                AiTool.builder()
                        .name("search_chamas")
                        .description("""
                                Search public chamas.
                                
                                Use this tool whenever a user asks:
                                - find chamas
                                - search for chamas
                                - show me chamas
                                - list savings groups
                                - discover chamas
                                
                                Do NOT use this tool to explain a specific chama.
                                """)
                        .parameters("""
                                {
                                "type":"object",
                                "properties": {
                                    "page":{"type":"integer"}
                                }
                                }
                                """)
                        .build(),

                AiTool.builder()
                        .name("get_chama")
                        .description("Retrieve one chama by id when the user asks about a specific chama.")
                        .parameters("""
                                {
                                "type":"object",
                                "properties":{
                                "id":{"type":"string"}
                                }
                                }
                                """)
                        .build(),

                AiTool.builder()
                        .name("get_user_memberships")
                        .description("Retrieve the current user's active chama memberships.")
                        .parameters("""
                                {
                                "type":"object",
                                "properties": {}
                                }
                                """)
                        .build(),

                AiTool.builder()
                        .name("recommend_chamas")
                        .description("Recommend savings groups")
                        .parameters("""
                                {
                                "type":"object",
                                "properties":{
                                
                                "goal":{"type":"string"},
                                
                                "monthlyContribution":{"type":"integer"},
                                
                                "riskTolerance":{"type":"string"}
                                
                                }
                                }
                                """)
                        .build()
        );
    }
}
