package com.dada_labs_two.chamavault.payments.constants;

public enum TransactionStatus {
    CREATED,
    ACCEPTED, //terminal
    REJECTED,
    TERMINATED,
    CANCELED,
    COMPLETED,
    DISCARDED,
    PENDING,
    PROCESSING,
    FAILED  //terminal
}
