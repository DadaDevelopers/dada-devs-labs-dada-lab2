package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record LnurlPayLinkResponse(
        String id,
        String description,
        Long min,
        Long max,
        String comment_chars,
        String success_text,
        String success_url,
        String currency,
        String webhook_url,
        String webhook_headers,
        String webhook_body,
        String webhook_method,
        Boolean enabled,
        Integer fiat_base_multiplier,
        String username,
        String domain,
        String lnurl,
        Boolean served
) {}

