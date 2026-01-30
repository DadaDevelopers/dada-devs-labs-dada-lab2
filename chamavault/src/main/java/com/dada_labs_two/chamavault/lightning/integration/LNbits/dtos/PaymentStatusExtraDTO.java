package com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentStatusExtraDTO {
    @JsonProperty("wallet_fiat_currency")
    private String walletFiatCurrency;

    @JsonProperty("wallet_fiat_amount")
    private double walletFiatAmount;

    @JsonProperty("wallet_fiat_rate")
    private double walletFiatRate;

    @JsonProperty("wallet_btc_rate")
    private double walletBtcRate;
}
