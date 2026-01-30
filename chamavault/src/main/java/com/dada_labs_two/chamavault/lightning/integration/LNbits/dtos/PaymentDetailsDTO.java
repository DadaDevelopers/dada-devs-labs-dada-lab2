package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;


@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDetailsDTO {
    @JsonProperty("checking_id")
    private String checkingId;

    @JsonProperty("payment_hash")
    private String paymentHash;

    @JsonProperty("wallet_id")
    private String walletId;

    private long amount;
    private long fee;
    private String bolt11;

    @JsonProperty("payment_request")
    private String paymentRequest;

    @JsonProperty("fiat_provider")
    private String fiatProvider;

    private String status;
    private String memo;
    private OffsetDateTime expiry;
    private String webhook;

    @JsonProperty("webhook_status")
    private String webhookStatus;

    private String preimage;
    private String tag;
    private String extension;
    private OffsetDateTime time;

    @JsonProperty("created_at")
    private OffsetDateTime createdAt;

    @JsonProperty("updated_at")
    private OffsetDateTime updatedAt;

    private List<String> labels;
    private PaymentStatusExtraDTO extra;
}
