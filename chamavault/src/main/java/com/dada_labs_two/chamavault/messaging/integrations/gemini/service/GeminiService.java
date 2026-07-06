package com.dada_labs_two.chamavault.messaging.integrations.gemini.service;

import com.google.genai.types.GenerateContentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.genai.Client;

@Service
public class GeminiService {
    @Value("${spring.ai.google.genai.model}")
    private String model;

    private final Client client;

    public GeminiService(Client client) {
        this.client = client;
    }

    public String getChatResponse(String prompt) {
        try {
            GenerateContentResponse response = client.models.generateContent(model, prompt, null);
            return response.text();
        } catch (com.google.genai.errors.ClientException e) {
            System.err.println("Gemini SDK Error: " + e.getMessage());
            throw e;
        }
    }
}
