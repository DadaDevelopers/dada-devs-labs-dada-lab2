package com.dada_labs_two.chamavault.users.dtos;

import com.dada_labs_two.chamavault.users.models.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponseDTO {
    private String token;
    private Date expiration;
    private User user;
}
