package com.dada_labs_two.chamavault.lightning.integration.LNbits;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Component
public class LNbitsClient {

    private final WebClient webClient;

    public LNbitsClient(@Value("${lnbits.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /* ---------- Wallets ---------- */

    public WalletResponse createWallet(String adminKey, String userId, CreateWalletRequest request) {
        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/wallet")
                        .queryParam("usr", userId)
                        .build())
                .header("X-Api-Key", adminKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(WalletResponse.class)
                .block();
    }


    public WalletDetails getWallet(String walletKey) {
        return webClient.get()
                .uri("/api/v1/wallet")
                .header("X-Api-Key", walletKey)
                .retrieve()
                .bodyToMono(WalletDetails.class)
                .block();
    }

    /* ---------- Invoices ---------- */

    public InvoiceResponse createInvoice(String walletKey, CreateInvoiceRequest request) {
        return webClient.post()
                .uri("/api/v1/payments")
                .header("X-Api-Key", walletKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(InvoiceResponse.class)
                .block();
    }

    public InvoiceResponse createInvoice(
            String walletKey,
            long amountSats,
            String memo
    ) {
        CreateInvoiceRequest request = new CreateInvoiceRequest(
                amountSats * 1000, // sats → msats
                memo,
                false              // out=false = receive
        );

        return webClient.post()
                .uri("/api/v1/payments")
                .header("X-Api-Key", walletKey)
                .bodyValue(request)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new RuntimeException("LNbits error: " + body))
                )
                .bodyToMono(InvoiceResponse.class)
                .block();
    }


    public PaymentStatus getPayment(String walletKey, String paymentHash) {
        return webClient.get()
                .uri("/api/v1/payments/{hash}", paymentHash)
                .header("X-Api-Key", walletKey)
                .retrieve()
                .bodyToMono(PaymentStatus.class)
                .block();
    }

    public PayInvoiceResponse payInvoice(
            String walletKey,
            String bolt11Invoice
    ) {
        PayInvoiceRequest request = new PayInvoiceRequest(
                bolt11Invoice,
                true // out=true = pay
        );

        return webClient.post()
                .uri("/api/v1/payments")
                .header("X-Api-Key", walletKey)
                .bodyValue(request)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new RuntimeException("LNbits error: " + body))
                )
                .bodyToMono(PayInvoiceResponse.class)
                .block();
    }


    public PayInvoiceResponse payInvoice(String walletKey, PayInvoiceRequest request) {
        return webClient.post()
                .uri("/api/v1/payments")
                .header("X-Api-Key", walletKey)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(PayInvoiceResponse.class)
                .block();
    }

    /* ---------- Lightning Address ---------- */

    public LNURLPayResponse getLnurlPay(String username) {
        return webClient.get()
                .uri("/.well-known/lnurlp/{username}", username)
                .retrieve()
                .bodyToMono(LNURLPayResponse.class)
                .block();
    }


    /* ------------ Assign Lightning Address------------*/
    public LnurlPayLinkResponse createLightningAddress(
            String adminKey,
            CreateLnurlPayLinkRequest request
    ) {
        return webClient.post()
                .uri("/lnurlp/api/v1/links")
                .header("X-Api-Key", adminKey)
                .bodyValue(request)
                .retrieve()
                .onStatus(
                        status -> status.is4xxClientError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new RuntimeException("LNbits error: " + body))
                )
                .bodyToMono(LnurlPayLinkResponse.class)
                .block();

    }



    /*----------- Payments------------------------*/
    public List<PaymentStatus> listPayments(String walletKey) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/v1/payments")
                        .queryParam("limit", 50)
                        .build())
                .header("X-Api-Key", walletKey)
                .retrieve()
                .onStatus(
                        status -> status.isError(),
                        response -> response.bodyToMono(String.class)
                                .map(body -> new RuntimeException("LNbits error: " + body))
                )
                .bodyToMono(new ParameterizedTypeReference<List<PaymentStatus>>() {})
                .block();
    }



}
