package com.dada_labs_two.chamavault.project_commons.codes.dtos;

import lombok.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class CodeDTO {
    private String code;
    private String name;
    private String description;
    /** Nullable so clients may omit it or send null; pre-registration OTPs are always activated. */
    private Boolean active;
    private ZonedDateTime expirationDate;
    private String ownerMsisdn;
    /** Email address or phone number. Preferred over ownerMsisdn for pre-registration OTPs. */
    private String identifier;
    /** Explicit email compatibility field; identifier is preferred. */
    private String email;
    private Map<String, String> extraData = new HashMap<>();
}
