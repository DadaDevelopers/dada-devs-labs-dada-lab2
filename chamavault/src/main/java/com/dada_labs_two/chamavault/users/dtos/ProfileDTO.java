package com.dada_labs_two.chamavault.users.dtos;

import com.dada_labs_two.chamavault.project_commons.countries.models.Countries;
import com.dada_labs_two.chamavault.project_commons.roles.models.Roles;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class ProfileDTO {
    private UUID userReference;
    private String msisdn;
    private String username;
    private Boolean enabled;
    private Boolean isVerified;
    private ZonedDateTime createdAt;
    private Set<Roles> roles;
    private Set<Countries> countries;
    private Set<UUID> referrals = new HashSet<>();
    private String referralCode;
    private Map<String, String> kyc = new HashMap<>();
}
