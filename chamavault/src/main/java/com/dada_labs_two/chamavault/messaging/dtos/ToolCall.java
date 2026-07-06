package com.dada_labs_two.chamavault.messaging.dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ToolCall {

    private String name;

    /**
     * Raw JSON string of arguments
     */
    private String arguments;
}
