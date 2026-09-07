package com.dada_labs_two.chamavault.contributions.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record GroupWalletContributionRequest(
        @Min(value = 1, message = "amountSats must be positive") long amountSats,
        @NotNull UUID fundingWalletReference) {
}
