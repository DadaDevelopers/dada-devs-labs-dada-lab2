package com.dada_labs_two.chamavault.chama.activities;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.users.models.User;
import java.time.ZonedDateTime;
import java.util.*;
public record RecordChamaActivity(Chama chama, User actor, ChamaActivityType type, ActivityCategory category,
 ActivityStatus status, ActivityVisibility visibility, String title, String description, String subjectType,
 String subjectReference, Long amountSats, UUID walletReference, UUID transactionReference,
 UUID governanceRequestReference, String eventKey, Map<String,String> metadata, ZonedDateTime occurredAt) {}
