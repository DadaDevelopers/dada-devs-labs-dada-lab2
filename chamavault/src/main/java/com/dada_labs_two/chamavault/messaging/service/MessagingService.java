package com.dada_labs_two.chamavault.messaging.service;

import com.dada_labs_two.chamavault.messaging.integrations.gmail.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessagingService {
    private final EmailService emailService;

    public void sendEmail(String to, String subject, String body) {
        emailService.sendEmail(to, subject, body);
    }
}
