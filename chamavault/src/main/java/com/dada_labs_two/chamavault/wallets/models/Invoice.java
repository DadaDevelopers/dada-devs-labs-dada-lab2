package com.dada_labs_two.chamavault.wallets.models;


import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.wallets.constants.InvoiceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at is null")
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID invoiceReference;

    @Column(unique = true, nullable = false)
    private String paymentHash;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String bolt11;

    @ManyToOne
    @JoinColumn(name = "invoice_creator_wallet_id")
    private Wallet invoicerCreator;

    @ManyToOne
    @JoinColumn(name = "invoice_payer_wallet_id")
    private Wallet invoicePayer;

    private Long amountSats;

    private Long fees;

    @Enumerated(EnumType.STRING)
    private InvoiceStatus status;

    private ZonedDateTime expiresAt;

    @CreationTimestamp
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    private ZonedDateTime updatedAt;

    private ZonedDateTime deletedAt;

    private ZonedDateTime paidAt;
}
