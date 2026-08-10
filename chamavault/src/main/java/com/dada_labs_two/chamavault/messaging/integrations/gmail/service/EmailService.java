package com.dada_labs_two.chamavault.messaging.integrations.gmail.service;

import com.dada_labs_two.chamavault.messaging.dtos.RecipientDTO;
import com.dada_labs_two.chamavault.messaging.models.Messages;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

import static reactor.netty.http.HttpConnectionLiveness.log;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body){
        log.debug("start process of sending email via GMAIL");

        try {
            MimeMessage email =  mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(email, true);

            helper.setFrom("ChamaVault");
            helper.setTo(mapper(List.of(new RecipientDTO(to, to))));
            helper.setSubject(subject);
            helper.setText(body);
            log.info("email to be sent {}", email);
            mailSender.send(email);

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    private InternetAddress[] mapper(Collection<RecipientDTO> emails) {
        log.info("Mapping Emails to Internet Address <<start>>");

        var internetAddresses = emails.stream().map(emailAddressDTO -> {
            try {
                return  new InternetAddress(emailAddressDTO.recipient(), emailAddressDTO.name());
            } catch (UnsupportedEncodingException e) {
                log.error("failed to map email {} skipping", emailAddressDTO.recipient());
            }
            return null;
        }).filter(Objects::nonNull).toList().toArray(InternetAddress[]:: new);

        log.info("array of internet address {}", Arrays.toString(internetAddresses));

        return internetAddresses;
    }
}
