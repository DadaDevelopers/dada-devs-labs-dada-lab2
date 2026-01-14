package com.dada_labs_two.chamavault.lightning.services;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.LNbitsClient;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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
//
//    public WalletDetails getUserWallet(String userId) {
//        WalletDetails wallet = client.getWallet(userWalletKey);
//        long sats = wallet.balance() / 1000; // msats → sats
//    return null;
//    }
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
