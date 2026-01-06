package com.dada_labs_two.chamavault.configs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiError {
    private String message;
    private String error;
    private int status;
    private ZonedDateTime timestamp = ZonedDateTime.now();

    public ApiError(String duplicateOrInvalidDatabaseValue, String message, int value) {
        this.message = duplicateOrInvalidDatabaseValue;
        this.error = message;
        this.status = value;
    }
}
