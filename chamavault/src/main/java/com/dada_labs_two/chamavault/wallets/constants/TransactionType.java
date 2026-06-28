package com.dada_labs_two.chamavault.wallets.constants;

public enum TransactionType {
    CREDIT, //Money enters this wallet
    DEBIT, //Money leaves this wallet
    INTERNAL_MOVE //optional, if you represent transfers as a single record
}
