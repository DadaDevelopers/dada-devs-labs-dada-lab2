package com.dada_labs_two.chamavault.users.repository;

import com.dada_labs_two.chamavault.wallets.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByPaymentHash(String paymentHash);
}
