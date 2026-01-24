package com.dada_labs_two.chamavault.chama.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChamaCreatorDTO {
    private String msisdn;
    private String username;
}
