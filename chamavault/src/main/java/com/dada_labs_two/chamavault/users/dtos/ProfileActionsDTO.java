package com.dada_labs_two.chamavault.users.dtos;

import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileActionsDTO {
    private String action;
    private Activity activity;
    private String description;
    private String reason;
    private Integer count = 0;
    private String comment;
    private ZonedDateTime deadline;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastPerformedAt;
}
