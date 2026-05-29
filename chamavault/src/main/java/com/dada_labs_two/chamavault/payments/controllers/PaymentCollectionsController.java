package com.dada_labs_two.chamavault.payments.controllers;

import com.dada_labs_two.chamavault.payments.dtos.FundWalletByMpesa;
import com.dada_labs_two.chamavault.payments.dtos.OnrampResponseDTO;
import com.dada_labs_two.chamavault.payments.services.OnRampService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.InvalidObjectException;

@Controller
@RequestMapping("/api/v1/payments/collections")
@RequiredArgsConstructor
public class PaymentCollectionsController {
    private final OnRampService onRampService;

    @PostMapping("/fund-wallet/mpesa")
    ResponseEntity<OnrampResponseDTO> fundWalletMpesa(@RequestBody @Valid FundWalletByMpesa request) throws InvalidObjectException {
        return ResponseEntity.ok(onRampService.triggerOnrampViaMpesa(request));
    }
}
