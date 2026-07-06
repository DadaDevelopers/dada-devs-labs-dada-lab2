package com.dada_labs_two.chamavault.messaging.dtos;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ChatRequest {

    private UUID conversationId; // nullable for first chat

    private String message;
}
