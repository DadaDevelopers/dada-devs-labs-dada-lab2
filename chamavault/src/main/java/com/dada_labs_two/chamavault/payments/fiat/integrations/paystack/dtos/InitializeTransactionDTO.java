package com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.dtos;

import java.math.BigDecimal;

public record InitializeTransactionDTO(String email, BigDecimal amount) {
}
