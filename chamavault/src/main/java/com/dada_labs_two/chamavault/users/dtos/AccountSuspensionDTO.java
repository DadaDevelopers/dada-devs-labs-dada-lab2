package com.dada_labs_two.chamavault.users.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountSuspensionDTO {
    private String msisdn;
    private String action;
    private String description;
    private String reason;
    private String comment;
    private ZonedDateTime deadline;
}
