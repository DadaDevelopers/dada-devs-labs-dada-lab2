package com.dada_labs_two.chamavault.messaging.dtos;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AiTool {
    private String name;
    private String description;
    /**
     * JSON schema
     */
    private String parameters;
}
