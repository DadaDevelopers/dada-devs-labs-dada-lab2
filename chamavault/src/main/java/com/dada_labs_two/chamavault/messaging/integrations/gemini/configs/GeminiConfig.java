package com.dada_labs_two.chamavault.messaging.integrations.gemini.configs;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${spring.ai.google.genai.api-key}")
    private String apiKey;

    @Bean
    public Client geminiClient(){
        return Client.builder()
                .apiKey(apiKey)
                .build();
    }
}
