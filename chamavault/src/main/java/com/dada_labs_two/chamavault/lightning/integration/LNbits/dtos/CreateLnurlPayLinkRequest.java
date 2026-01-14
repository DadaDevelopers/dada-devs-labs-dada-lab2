package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

public record CreateLnurlPayLinkRequest(
        String description,
        long min,
        long max,
        int comment_chars,
        String username
) {}

