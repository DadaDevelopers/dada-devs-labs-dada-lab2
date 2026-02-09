package com.dada_labs_two.chamavault.wallets.controllers;

import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.wallets.dtos.CreateTopUpDTO;
import com.dada_labs_two.chamavault.wallets.dtos.MakeInvoicePaymentDTO;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.services.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
public class TransactionsController {
    private final TransactionService transactionService;

    @PostMapping("/make-rotational-payments")
    ResponseEntity<Transaction> makeRotationalPayments(@RequestParam Integer contributionCycleReference,
                                                       @RequestParam String msisdn,
                                                       @RequestParam Boolean moveFundsFromPreviousAccounts, //@todo an enum for fundingtypes(previous account, from fiat etc)
                                                       @RequestParam UUID walletToMoveFundsFrom) {
        ;
        return ResponseEntity.ok(transactionService.makeRotationalPayments(
                contributionCycleReference,msisdn, moveFundsFromPreviousAccounts, walletToMoveFundsFrom));
    }

    @PostMapping("/pay-invoice")
    ResponseEntity<Transaction> payInvoicePayment(@RequestBody MakeInvoicePaymentDTO makeInvoicePaymentDTO) {
        return ResponseEntity.ok(transactionService.makeInvoicePayment(makeInvoicePaymentDTO.payerWalletId(),
                makeInvoicePaymentDTO.beneficiaryInvoice()));
    }

    @GetMapping("/find-by/{rotationIndex}")
    Page<Transaction> findByRotationIndex(@PathVariable Integer rotationIndex, Pageable pageable) {
        return transactionService.findByRotationIndex(rotationIndex, pageable);
    }

    @PostMapping("/wallet-top-up")
    ResponseEntity<Transaction> makeInternalWalletTopUp(@RequestBody CreateTopUpDTO request) {
        return ResponseEntity.ok(transactionService.topUpAWallet(request.senderWalletId(),
                request.recipientWalletId(), request.amountSats(), request.memo()));
    }
}
