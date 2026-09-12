package com.dada_labs_two.chamavault.chama.activities;
import java.time.ZonedDateTime;
import java.util.*;
public record ChamaActivityDTO(UUID reference, UUID chamaReference, ChamaActivityType activityType,
 ActivityCategory category, ActivityStatus status, ActivityVisibility visibility, UUID actorUserReference,
 String actorUsername, String title, String description, String subjectType, String subjectReference,
 Long amountSats, UUID walletReference, UUID transactionReference, UUID governanceRequestReference,
 Map<String,String> metadata, ZonedDateTime occurredAt) {}
