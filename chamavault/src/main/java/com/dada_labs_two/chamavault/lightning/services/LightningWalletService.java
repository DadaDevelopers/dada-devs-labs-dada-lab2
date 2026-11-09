package com.dada_labs_two.chamavault.lightning.services;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.LNbitsClient;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import com.dada_labs_two.chamavault.lightning.integration.blink.BlinkClient;
import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class LightningWalletService {

    private final LNbitsClient client;
    private final BlinkClient blinkClient;
    private final LightningProviderConfigService providerConfig;
    private final String accessToken;
    private final String username;
    private final String password;

    public LightningWalletService(LNbitsClient client,
                         BlinkClient blinkClient,
                         LightningProviderConfigService providerConfig,
                         @Value("${lnbits.access-token:}") String accessToken,
                         @Value("${lnbits.username:}") String username,
                         @Value("${lnbits.password:}") String password
    ) {
        this.client = client;
        this.blinkClient = blinkClient;
        this.providerConfig = providerConfig;
        this.accessToken = accessToken;
        this.username = username;
        this.password = password;
    }

    public WalletResponse createUserWallet(String name) {
        if (providerConfig.activeProvider() == LightningProviderType.BLINK) {
            return blinkClient.createVirtualWallet(name);
        }
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
        if (isBlinkReference(walletKey)) return blinkClient.getPaymentFees(paymentHash);
        return client.getPaymentFees(walletKey, paymentHash);
    }

    public WalletDetails getUserWallet(String userWalletKey) {
        if (isBlinkReference(userWalletKey)) return blinkClient.backingWallet();
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
                isBlinkReference(walletInKey)
                        ? blinkClient.createInvoice(amountSats, memo)
                        : client.createInvoice(walletInKey, amountSats, memo);
        log.info("Invoice created: {}", invoice);

        return invoice.payment_request(); // BOLT11
    }

    public String payInvoice(
            String walletInKey,
            String bolt11Invoice
    ) {
        PayInvoiceResponse response = payInvoiceWithStatus(walletInKey, bolt11Invoice);

        if (!response.paid()) {

            log.info("Invoice not paid");
        }

        return response.payment_hash(); // IMPORTANT for ledger
    }

    public PayInvoiceResponse payInvoiceWithStatus(String walletKey, String bolt11Invoice) {
        PayInvoiceResponse response = isBlinkReference(walletKey)
                ? blinkClient.payInvoice(bolt11Invoice)
                : client.payInvoice(walletKey, bolt11Invoice);
        if (response == null || response.payment_hash() == null || response.payment_hash().isBlank())
            throw new IllegalStateException("Lightning provider did not return a payment hash");
        return response;
    }

    public List<PaymentStatus> listPayments(String walletKey) {
        if (isBlinkReference(walletKey)) return blinkClient.listPayments();
        return client.listPayments(walletKey);
    }

    public PaymentStatus checkInvoicePaymentStatus(String walletInKey, String invoicePaymentHash) {
        PaymentStatus status = isBlinkReference(walletInKey)
                ? blinkClient.getPayment(invoicePaymentHash)
                : client.getPayment(walletInKey, invoicePaymentHash);

        if (status.paid()) {
            // settled
        }

        return status;
    }

    public void enableLnurlpExtension() {
        if (providerConfig.activeProvider() == LightningProviderType.BLINK) {
            throw new UnsupportedOperationException("LNURLp extension management is only available with LNbits");
        }
        log.info("Enabling lnurlp extension for wallet...");
        client.enableExtension(accountAccessToken(), new EnableExtensionRequest("lnurlp", true));
    }

    public List<WalletResponse> listUserWallets() {
        if (providerConfig.activeProvider() == LightningProviderType.BLINK) {
            WalletDetails backing = blinkClient.backingWallet();
            return List.of(new WalletResponse(BlinkClient.REFERENCE_PREFIX + backing.id(), backing.name(),
                    null, null, "omnibus", BlinkClient.REFERENCE_PREFIX + backing.id(),
                    backing.id(), "BTC", String.valueOf(backing.balance())));
        }
        return client.listWallets(accountAccessToken());
    }

    public boolean isOmnibusWallet(String walletReference) {
        return isBlinkReference(walletReference);
    }

    public LightningProviderType activeProvider() {
        return providerConfig.activeProvider();
    }

    private boolean isBlinkReference(String walletReference) {
        return walletReference != null && walletReference.startsWith(BlinkClient.REFERENCE_PREFIX);
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
