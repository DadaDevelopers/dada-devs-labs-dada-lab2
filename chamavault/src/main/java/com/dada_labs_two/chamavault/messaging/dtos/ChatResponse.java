package com.dada_labs_two.chamavault.messaging.dtos;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class ChatResponse {

    private UUID conversationId;

    private String response;
}
