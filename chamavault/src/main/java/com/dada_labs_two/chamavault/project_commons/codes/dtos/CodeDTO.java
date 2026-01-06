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
    private boolean active;
    private ZonedDateTime expirationDate;
    private String ownerMsisdn;
    private Map<String, String> extraData = new HashMap<>();
}
