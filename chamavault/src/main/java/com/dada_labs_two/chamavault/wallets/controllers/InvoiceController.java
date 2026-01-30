package com.dada_labs_two.chamavault.wallets.controllers;

import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.repository.InvoiceRepository;
import com.dada_labs_two.chamavault.wallets.constants.InvoiceStatus;
import com.dada_labs_two.chamavault.wallets.dtos.CreateInvoiceDto;
import com.dada_labs_two.chamavault.wallets.dtos.InvoiceDto;
import com.dada_labs_two.chamavault.wallets.dtos.InvoiceStatusDto;
import com.dada_labs_two.chamavault.wallets.models.Invoice;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import com.dada_labs_two.chamavault.wallets.services.Bolt11Utils;
import com.dada_labs_two.chamavault.wallets.services.QrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallets")
@RequiredArgsConstructor
public class InvoiceController {

    private final WalletRepository walletRepository;
    private final InvoiceRepository invoiceRepository;
    private final LightningWalletService lightningWalletService;
    private final QrCodeService qrCodeService;

    @PostMapping("/{walletId}/invoice")
    public ResponseEntity<InvoiceDto> createInvoice(
            @PathVariable UUID walletId,
            @RequestBody CreateInvoiceDto request
    ) {

        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow();

        String bolt11 = lightningWalletService.createInvoice(
                wallet.getLightning().get("inkey"),
                request.amountSats(),
                request.memo()
        );

        String paymentHash =
                Bolt11Utils.extractPaymentHash(bolt11);

        String qr =
                qrCodeService.generateBase64Png(bolt11);

        Invoice invoice = invoiceRepository.save(
                Invoice.builder()
                        .paymentHash(paymentHash)
                        .invoicerCreator(wallet)
                        .bolt11(bolt11)
                        .amountSats(request.amountSats())
                        .status(InvoiceStatus.PENDING)
                        .expiresAt(Bolt11Utils.extractExpiry(bolt11))
                        .build()
        );


        return ResponseEntity.ok(new InvoiceDto(
                bolt11,
                paymentHash,
                request.amountSats(),
                request.amountSats() * 1000,
                qr,
                ZonedDateTime.now().plusMinutes(15)
        ));
    }

    @GetMapping("/user-invoices/{walletId}")
    public ResponseEntity<Page<InvoiceDto>> getInvoice(Pageable pageable, @PathVariable UUID walletId ) {
        Wallet wallet = walletRepository.findById(walletId).orElseThrow();

        return ResponseEntity.ok(toDtoPage(invoiceRepository.findAllByInvoicerCreator(pageable, wallet)));
    }


    @GetMapping("/invoices/{paymentHash}")
    public ResponseEntity<InvoiceStatusDto> getInvoiceStatus(@PathVariable String paymentHash) {

        Invoice invoice = invoiceRepository.findByPaymentHash(paymentHash)
                .orElseThrow();

        return ResponseEntity.ok(new InvoiceStatusDto(
                invoice.getPaymentHash(),
                invoice.getStatus(),
                invoice.getPaidAt()
        ));
    }


    public InvoiceDto toDto(Invoice invoice) {
        // Handle null safety for amountSats just in case
        long amountSats = invoice.getAmountSats() != null ? invoice.getAmountSats() : 0L;

        return new InvoiceDto(
                invoice.getBolt11(),                  // invoice
                invoice.getPaymentHash(),             // paymentHash
                amountSats,                            // amountSats
                amountSats * 1000,                     // amountMsats (converted)
                qrCodeService.generateBase64Png(invoice.getBolt11()), // qrCode (regenerated)
                invoice.getExpiresAt()                 // expiresAt
        );
    }

    /**
     * Helper method to map a Page of Invoices to a Page of InvoiceDtos.
     * Useful for the controller endpoint using Pageable.
     */
    public Page<InvoiceDto> toDtoPage(Page<Invoice> invoices) {
        return invoices.map(this::toDto);
    }
}

