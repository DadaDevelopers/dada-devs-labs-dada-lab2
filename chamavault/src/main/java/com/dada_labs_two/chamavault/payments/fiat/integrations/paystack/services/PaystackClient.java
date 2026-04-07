package com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.services;

import com.dada_labs_two.chamavault.payments.constants.TransactionStatus;
import com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.dtos.InitializeTransactionDTO;
import com.dada_labs_two.chamavault.payments.fiat.integrations.paystack.dtos.InitiatePaystackTransactionResponseDTO;
import com.dada_labs_two.chamavault.payments.models.Payment;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class PaystackClient {
    private final WebClient webClient;

    @Value("${paystack.payments.base-url}")
    private String baseUrl;

    @Value("${paystack.payments.secret-key}")
    private String key;

    public  PaystackClient(@Value("${paystack.payments.base-url}") String baseUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public Payment initializeTransaction(Payment payment){
        InitializeTransactionDTO transactionDTO = new InitializeTransactionDTO(
                payment.getAccountNumber(), payment.getAmount());
        var response = webClient.post()
                .uri(uriBuilder -> uriBuilder.path("/transaction/initialize").build())
                .header(HttpHeaders.AUTHORIZATION, "Bearer ".concat(key))
                .bodyValue(transactionDTO)
                .retrieve()
                .bodyToMono(InitiatePaystackTransactionResponseDTO.class)
                .block();
        log.info("Initiate Paystack Transaction Object response: {}", response);

        if (response != null && response.getData() != null && response.getData().getAuthorizationUrl() != null) {
            //PS: Not saving the checkout url because in case of Data Breach: If database is compromised, an attacker
            // could potentially obtain these links and send fraudulent payment requests to customers.
            //so in case customer needs a retrigger, just initiate a new request
            payment.getMetadata().put("checkout", response.getData().getAuthorizationUrl());
            payment.setPaymentProviderReference(response.getData().getReference());
            payment.setProviderDescription(response.getMessage());
            payment.setReceiptNumber(response.getData().getAccessCode());
            payment.setTransactionStatus(TransactionStatus.PROCESSING);
        } else {
            payment.setTransactionStatus(TransactionStatus.FAILED);
        }

        return payment;
    }
}
