package com.dada_labs_two.chamavault.payments.controllers;

import com.dada_labs_two.chamavault.payments.dtos.CreateTransactionDTO;
import com.dada_labs_two.chamavault.payments.models.Payment;
import com.dada_labs_two.chamavault.payments.services.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private  final PaymentService paymentService;

    @PostMapping
    ResponseEntity<Payment> initiatePaymentProcessing(@RequestBody @Valid CreateTransactionDTO createPaymentDTO) throws Exception {
        return new ResponseEntity<>(paymentService.initiatePaymentProcessing(createPaymentDTO), HttpStatus.CREATED);
    }
}
