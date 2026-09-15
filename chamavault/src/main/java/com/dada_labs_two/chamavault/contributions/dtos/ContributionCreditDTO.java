package com.dada_labs_two.chamavault.contributions.dtos;
import com.dada_labs_two.chamavault.contributions.constants.*;
import java.time.ZonedDateTime;
import java.util.UUID;
public record ContributionCreditDTO(UUID reference,ContributionType contributionType,long originalAmountSats,
 long remainingAmountSats,ContributionCreditStatus status,UUID sourcePaymentReference,ZonedDateTime createdAt){}
