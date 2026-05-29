package com.dada_labs_two.chamavault.payments.exchange.onramp.bitika.services;

import com.dada_labs_two.chamavault.payments.exchange.onramp.bitika.dtos.BuySatsRequest;
import com.dada_labs_two.chamavault.payments.exchange.onramp.bitika.dtos.BuySatsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
public class BitikaClient {
    @Value("${bitika.payments.onramp.api.base-url}")
    private String apiUrl;

    @Value("${bitika.payments.onramp.api.secret-key}")
    private String secretKey;

    private final WebClient webClient;

    public BitikaClient(@Value("${bitika.payments.onramp.api.base-url}") String apiUrl,
                        @Value("${bitika.payments.onramp.api.secret-key}")  String secretKey) {
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                .build();
    }

    public BuySatsResponse buySats(String lightningInvoice, String phone) {
        try {
            var response = webClient.post()
                    .bodyValue(new BuySatsRequest(lightningInvoice, phone))
                    .retrieve()
                    .bodyToMono(BuySatsResponse.class)
                    .block();
            log.info("BuySatsResponse: {}", response.invoice_amount_sats());
            return response;
        } catch (WebClientResponseException e) {
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Response Body: {}", e.getResponseBodyAsString());

            throw new RuntimeException(e.getStatusCode() + " : " + e.getResponseBodyAsString());
        }
    }
}
