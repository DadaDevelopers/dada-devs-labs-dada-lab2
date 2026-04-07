package com.dada_labs_two.chamavault.payments.dtos;

import com.dada_labs_two.chamavault.payments.constants.PaymentProvider;
import com.dada_labs_two.chamavault.payments.constants.PaymentProviders;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateTransactionDTO(UUID userId,
                                   UUID walletId,
                                   PaymentProvider paymentProvider,
                                   String description,
                                   BigDecimal amount) {
}
