package com.dada_labs_two.chamavault.payments.exchange.offramp.tando.services;

import com.dada_labs_two.chamavault.payments.exchange.offramp.tando.dtos.LightningPaymentResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Component
public class TandoClient {

    @Value("${tando.payments.offramp.api.base-url}")
    private String apiUrl;

    private final WebClient webClient;

    public TandoClient(@Value("${tando.payments.offramp.api.base-url}") String apiUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .build();
    }

    //offramp to mpesa

    //create offramping invoice
    public LightningPaymentResponse createOffRampingLightningPayment(String msisdn, Long amountMilliSats) {
        try {
            var response = webClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/{msisdn}")
                            .queryParam("amount", amountMilliSats)
                            .build(msisdn))
                    .retrieve()
                    .bodyToMono(LightningPaymentResponse.class)
                    .block();
            log.info("initiate lightning payment of {}", response);
            return response;
        } catch (WebClientResponseException ex) {
            log.error("Status Code: {}", ex.getStatusCode());
            log.error("Response Body: {}", ex.getResponseBodyAsString());

            throw new RuntimeException(ex.getStatusCode() + " : " + ex.getResponseBodyAsString());
        }
    }
}
