package com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class InitiatePaystackTransactionResponseDataDTO {
    @JsonProperty("authorization_url")
    private String authorizationUrl;
    @JsonProperty("access_code")
    private String accessCode;
    @JsonProperty("reference")
    private String reference;
}
