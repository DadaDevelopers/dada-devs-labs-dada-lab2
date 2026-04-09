package com.dada_labs_two.chamavault.users.configs;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF for stateless REST APIs
                .csrf(AbstractHttpConfigurer::disable)

                // Stateless session management
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Set AuthenticationProvider
                .authenticationProvider(authenticationProvider)

                // JWT filter before AnonymousAuthenticationFilter
                .addFilterBefore(jwtAuthFilter, AnonymousAuthenticationFilter.class)

                // Disable anonymous authentication (prevents overwriting SecurityContext)
                .anonymous(AbstractHttpConfigurer::disable)

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/setup/**", "/webhooks", "/actuator/*",
                                "/users/recover-account/*", "/users/retrieve-account/*", "/users/forgot-password/*",
                                "/codes/pre-registration/*","/api/commons/**").permitAll()
                        .anyRequest().authenticated()
                )
                .build();
    }

    private UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://www.chamavault.xyz",
                "http://chamavault.xyz",
                "https://www.chamavault.xyz",
                "https://chamavault.xyz",
                "https://dada-devs-labs-dada-lab2-chamavault.onrender.com",
                "https://dada-devs-labs-dada-lab2.vercel.app"
        ));// frontend origin
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
