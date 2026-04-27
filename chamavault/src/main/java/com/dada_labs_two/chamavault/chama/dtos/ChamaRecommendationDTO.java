package com.dada_labs_two.chamavault.chama.dtos;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Builder
@Data
public class ChamaRecommendationDTO {
    private UUID chamaReference;
    private String name;
    private String reason;
    private Double score;
}
