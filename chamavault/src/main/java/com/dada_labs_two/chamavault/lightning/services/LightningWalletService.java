package com.dada_labs_two.chamavault.lightning.services;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.LNbitsClient;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class LightningWalletService {

    private final LNbitsClient client;
    private final String accessToken;
    private final String username;
    private final String password;

    public LightningWalletService(LNbitsClient client,
                         @Value("${lnbits.access-token:}") String accessToken,
                         @Value("${lnbits.username:}") String username,
                         @Value("${lnbits.password:}") String password
    ) {
        this.client = client;
        this.accessToken = accessToken;
        this.username = username;
        this.password = password;
    }

    public WalletResponse createUserWallet(String name) {
        WalletResponse wallet = client.createWallet(
                accountAccessToken(),
                new CreateWalletRequest("user-" + name, "lightning")
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

    public PaymentFees getPaymentFee(String walletKey, String paymentHash) {
        return client.getPaymentFees(walletKey, paymentHash);
    }

    public WalletDetails getUserWallet(String userWalletKey) {
        WalletDetails wallet = client.getWallet(userWalletKey);
        long sats = wallet.balance(); // sats
        return wallet;
    }

    public String createInvoice(
            String walletInKey,
            long amountSats,
            String memo
    ) {
        InvoiceResponse invoice =
                client.createInvoice(walletInKey, amountSats, memo);
        log.info("Invoice created: {}", invoice);

        return invoice.payment_request(); // BOLT11
    }

    public String payInvoice(
            String walletInKey,
            String bolt11Invoice
    ) {
        PayInvoiceResponse response =
                client.payInvoice(walletInKey, bolt11Invoice);

//        if (!response.paid()) {
//
//            throw new IllegalStateException("Invoice not paid");
//        }

        return response.payment_hash(); // IMPORTANT for ledger
    }

    public List<PaymentStatus> listPayments(String walletKey) {
        return client.listPayments(walletKey);
    }

    public PaymentStatus checkInvoicePaymentStatus(String walletInKey, String invoicePaymentHash) {
        PaymentStatus status = client.getPayment(walletInKey, invoicePaymentHash);

        if (status.paid()) {
            // settled
        }

        return status;
    }

    public void enableLnurlpExtension() {
        log.info("Enabling lnurlp extension for wallet...");
        client.enableExtension(accountAccessToken(), new EnableExtensionRequest("lnurlp", true));
    }

    public List<WalletResponse> listUserWallets() {
        return client.listWallets(accountAccessToken());
    }

    private String accountAccessToken() {
        if (username != null && !username.isBlank()) {
            return client.authenticate(username, password);
        }
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("Configure lnbits.username/password or lnbits.access-token for account operations");
        }
        return accessToken.trim();
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
