package com.dada_labs_two.chamavault.messaging.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class ToolExecutionResult {
    private String toolName;
    private String json;
}
