package com.dada_labs_two.chamavault.messaging.integrations.gmail.configs;


import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.UserCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Configuration
public class GmailConfig {

    @Value("${gmail.application-name}")
    private String applicationName;

    @Value("${gmail.oauth.client-id}")
    private String clientId;

    @Value("${gmail.oauth.client-secret}")
    private String clientSecret;

    @Value("${gmail.oauth.refresh-token}")
    private String refreshToken;

    @Bean
    public Gmail gmail() throws GeneralSecurityException, IOException {

        var httpTransport =
                GoogleNetHttpTransport.newTrustedTransport();

        var credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshToken)
                .build();

        HttpRequestInitializer requestInitializer =
                new HttpCredentialsAdapter(credentials);

        return new Gmail.Builder(
                httpTransport,
                GsonFactory.getDefaultInstance(),
                requestInitializer
        )
                .setApplicationName(applicationName)
                .build();
    }
}
