package com.dada_labs_two.chamavault.contributions.dtos;

import com.dada_labs_two.chamavault.contributions.constants.*;
import lombok.Builder;
import java.time.ZonedDateTime;
import java.util.UUID;

@Builder
public record ObligationDTO(UUID reference, UUID chamaReference, UUID memberReference,
        ContributionType type, String cycleReference, Long amountDueSats, Long amountPaidSats,
        Long outstandingAmountSats, ZonedDateTime dueAt, ObligationStatus status) {}
