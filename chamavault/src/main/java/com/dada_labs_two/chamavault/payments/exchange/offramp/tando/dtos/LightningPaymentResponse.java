package com.dada_labs_two.chamavault.payments.exchange.offramp.tando.dtos;

import java.util.List;

public record LightningPaymentResponse(
        String pr,
        List<Object> routes,
        SuccessAction successAction) {
    public record SuccessAction(
            String tag,
            String description,
            String url
    ) {}
}
