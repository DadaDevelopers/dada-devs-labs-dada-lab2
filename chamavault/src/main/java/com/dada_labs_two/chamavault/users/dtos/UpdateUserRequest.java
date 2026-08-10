package com.dada_labs_two.chamavault.users.dtos;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String username;
    private String msisdn;
    private String email;
    private String firstName;
    private String lastName;
    private String idNumber;
}
