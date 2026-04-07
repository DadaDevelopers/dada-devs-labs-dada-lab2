package com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.dtos;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class InitiatePaystackTransactionResponseDTO {
    private String status;
    private String message;
    private InitiatePaystackTransactionResponseDataDTO data;
}
