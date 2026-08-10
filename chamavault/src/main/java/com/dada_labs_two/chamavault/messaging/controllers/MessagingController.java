package com.dada_labs_two.chamavault.messaging.controllers;

import com.dada_labs_two.chamavault.messaging.dtos.SendMessage;
import com.dada_labs_two.chamavault.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/messaging/communication")
@RequiredArgsConstructor
public class MessagingController {
    private final MessagingService messagingService;

    @PostMapping("/gmail")
    public ResponseEntity<?> sendEmail(@RequestBody @Valid SendMessage message) {
        messagingService.sendEmail(message.to(), message.subject(), message.body());

        return ResponseEntity.ok("message dispatched");
    }
}
