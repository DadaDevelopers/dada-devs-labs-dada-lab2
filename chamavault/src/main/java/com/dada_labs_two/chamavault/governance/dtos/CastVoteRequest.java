package com.dada_labs_two.chamavault.governance.dtos;
import com.dada_labs_two.chamavault.governance.constants.CheckerDecision;
import jakarta.validation.constraints.NotNull;

public record CastVoteRequest(@NotNull CheckerDecision decision, String comment) {}
