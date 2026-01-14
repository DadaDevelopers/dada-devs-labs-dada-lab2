package com.dada_labs_two.chamavault.lightning.services;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.LNbitsClient;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LightningWalletService {

    private final LNbitsClient client;
    private final String adminKey;
    private final String userId;

    public LightningWalletService(LNbitsClient client,
                         @Value("${lnbits.admin-key}") String adminKey,
                         @Value("${lnbits.user-id}") String userId) {
        this.client = client;
        this.adminKey = adminKey;
        this.userId = userId;
    }

    public WalletResponse createUserWallet(String name) {
        WalletResponse wallet = client.createWallet(
                adminKey,
                userId,
                new CreateWalletRequest("user-" + name)
        );

        // Persist wallet.id + wallet.invoice_key
        return wallet;
    }

    public LnurlPayLinkResponse createLightningAddress(String adminKey,
                                                       String description,
                                                       long min,
                                                       long max,
                                                       int comment_chars,
                                                       String username){
        LnurlPayLinkResponse ln = client.createLightningAddress(adminKey,
                new CreateLnurlPayLinkRequest(description, min, max, comment_chars, username));
        return ln;
    }

    public WalletDetails getUserWallet(String userWalletKey) {
        WalletDetails wallet = client.getWallet(userWalletKey);
        long sats = wallet.balance() / 1000; // msats → sats
        return wallet;
    }

    public String createInvoice(
            String walletInKey,
            long amountSats,
            String memo
    ) {
        InvoiceResponse invoice =
                client.createInvoice(walletInKey, amountSats, memo);

        return invoice.payment_request(); // BOLT11
    }

    public String payInvoice(
            String walletInKey,
            String bolt11Invoice
    ) {
        PayInvoiceResponse response =
                client.payInvoice(walletInKey, bolt11Invoice);

        if (!response.paid()) {
            throw new IllegalStateException("Invoice not paid");
        }

        return response.payment_hash(); // IMPORTANT for ledger
    }

    public List<PaymentStatus> listPayments(String walletKey) {
        return client.listPayments(walletKey);
    }


//
//    public InvoiceResponse createInvoice(String walletKey) {
//        InvoiceResponse invoice = client.createInvoice(
//                walletKey,
//                new CreateInvoiceRequest(
//                        50_000, // 50 sats
//                        "Payment for order #123",
//                        false
//                )
//        );
//
//    }
//
//    public PayInvoiceResponse payLightningInvoice(){
//        PayInvoiceResponse response = client.payInvoice(
//                walletKey,
//                new PayInvoiceRequest(
//                        bolt11Invoice,
//                        true
//                )
//        );
//
//    }
//
//    public PaymentStatus checkInvoicePaymentStatus() {
//        PaymentStatus status = client.getPayment(walletKey, paymentHash);
//
//        if (status.paid()) {
//            // settled
//        }
//
//    }
}
