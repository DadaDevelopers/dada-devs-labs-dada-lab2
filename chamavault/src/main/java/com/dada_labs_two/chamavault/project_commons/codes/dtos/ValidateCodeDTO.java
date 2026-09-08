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
    /** Must match the email address or phone number used when the OTP was generated. */
    private String identifier;
    private String email;
}
