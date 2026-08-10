package com.dada_labs_two.chamavault.messaging.integrations.gmail.service;

import com.dada_labs_two.chamavault.messaging.dtos.RecipientDTO;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import jakarta.mail.Message.RecipientType;
import jakarta.mail.MessagingException;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Properties;

@Service
public class EmailService {

    private final Gmail gmail;

    private final String senderEmail;

    public EmailService(
            Gmail gmail,
            @Value("${gmail.sender-email}") String senderEmail
    ) {
        this.gmail = gmail;
        this.senderEmail = senderEmail;
    }

    public void sendEmail(
            String to,
            String subject,
            String body
    ) {

        try {

            MimeMessage email = createEmail(
                    to,
                    subject,
                    body
            );

            Message message = createGmailMessage(email);

            Message sentMessage = gmail.users()
                    .messages()
                    .send("me", message)
                    .execute();

            System.out.println(
                    "Email sent successfully. Gmail message ID: "
                            + sentMessage.getId()
            );

        } catch (MessagingException | IOException e) {

            throw new RuntimeException(
                    "Failed to send email via Gmail API",
                    e
            );
        }
    }

    private MimeMessage createEmail(
            String to,
            String subject,
            String body
    ) throws MessagingException, UnsupportedEncodingException {

        Properties properties = new Properties();

        Session session =
                Session.getInstance(properties);

        MimeMessage email =
                new MimeMessage(session);

        /*
         * Sender
         */
        email.setFrom(
                new InternetAddress(
                        senderEmail,
                        "ChamaVault"
                )
        );

        /*
         * Recipient
         */
        email.setRecipient(
                RecipientType.TO,
                new InternetAddress(to)
        );

        /*
         * Subject
         */
        email.setSubject(
                subject,
                StandardCharsets.UTF_8.name()
        );

        /*
         * Body
         */
        email.setText(
                body,
                StandardCharsets.UTF_8.name()
        );

        return email;
    }

    private Message createGmailMessage(
            MimeMessage email
    ) throws MessagingException, IOException {

        ByteArrayOutputStream buffer =
                new ByteArrayOutputStream();

        email.writeTo(buffer);

        String encodedEmail =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(
                                buffer.toByteArray()
                        );

        Message message = new Message();

        message.setRaw(encodedEmail);

        return message;
    }
}