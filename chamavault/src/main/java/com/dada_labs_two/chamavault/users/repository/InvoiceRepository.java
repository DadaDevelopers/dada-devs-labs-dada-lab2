package com.dada_labs_two.chamavault.users.repository;

import com.dada_labs_two.chamavault.wallets.models.Invoice;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;
import java.time.ZonedDateTime;
import com.dada_labs_two.chamavault.wallets.constants.InvoiceStatus;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByPaymentHash(String paymentHash);

    Page<Invoice> findAllByInvoicerCreator(Pageable pageable, Wallet invoicerCreator);
    boolean existsByInvoicerCreatorAndStatusAndExpiresAtAfter(Wallet invoicerCreator, InvoiceStatus status,
                                                               ZonedDateTime at);
}
