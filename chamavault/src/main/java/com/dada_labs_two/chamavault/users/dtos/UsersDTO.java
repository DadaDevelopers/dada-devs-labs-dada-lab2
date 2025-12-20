package com.dada_labs_two.chamavault.users.dtos;

import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Data
@ToString
public class UsersDTO {
    @NotBlank(message = "please enter the msisdn")
    private String msisdn;

    @NotBlank(message = "please enter the password")
    private String password;

    @NotBlank(message = "please enter the re-enter password")
    private String passwordReEntered;

    @NotNull(message = "please enter the roles")
    private Set<Roles> roles;

    @NotNull(message = "please enter the country")
    private Set<String> countries;

    private Map<String, String> kyc = new HashMap<>();

    private String referralCode;
    private String username;
}
