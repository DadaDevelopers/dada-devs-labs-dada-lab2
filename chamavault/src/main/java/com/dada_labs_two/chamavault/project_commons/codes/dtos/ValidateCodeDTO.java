package com.dada_labs_two.chamavault.project_commons.codes.dtos;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class ValidateCodeDTO {
    private String code;
    private String ownerMsisdn;
}
