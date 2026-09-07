package com.dada_labs_two.chamavault.contributions.dtos;
import jakarta.validation.constraints.*;
import java.util.UUID;
public record PayObligationRequest(@NotNull UUID fundingWalletReference, @NotNull @Positive Long amountSats) {}
