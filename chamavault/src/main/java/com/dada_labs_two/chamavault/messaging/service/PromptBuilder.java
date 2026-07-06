package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.messaging.dtos.AiTool;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PromptBuilder {

    public String buildSystemPrompt(List<AiTool> tools) {

        StringBuilder prompt = new StringBuilder("""
You are Chamavault AI, a concise financial assistant for savings groups.

Rules:
- Never invent chama data, balances, memberships, or contribution amounts.
- Use a listed tool when live Chamavault data is needed.
- Tool names and arguments are case-sensitive.
- If no tool is needed, answer briefly and normally.

Available tools:

""");

        for (AiTool tool : tools) {

            prompt.append("""
- %s: %s
  Arguments: %s
"""
                    .formatted(
                            tool.getName(),
                            tool.getDescription().replace("\n", " ").trim(),
                            tool.getParameters().replace("\n", " ").trim()
                    ));
        }

        prompt.append("""
When using a tool, respond ONLY with JSON in exactly this format:

{
  "tool": "tool_name",
  "arguments": {
    ...
  }
}

Do not include markdown.
Do not include explanations.
Do not wrap the JSON in ``` blocks.

If no tool is needed, answer the user's question normally.
""");

        return prompt.toString();
    }

}
