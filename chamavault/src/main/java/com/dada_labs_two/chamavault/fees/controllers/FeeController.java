package com.dada_labs_two.chamavault.fees.controllers;

import com.dada_labs_two.chamavault.fees.dtos.*;
import com.dada_labs_two.chamavault.fees.models.FeeRule;
import com.dada_labs_two.chamavault.fees.services.FeeService;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/fees")
public class FeeController {
    private final FeeService service;

    @GetMapping("/quote")
    public FeeQuote quote(@RequestParam TransactionCategory category, @RequestParam long amountSats) {
        return service.quote(category, amountSats);
    }

    @PostMapping("/rules")
    public ResponseEntity<FeeRule> create(@AuthenticationPrincipal User user, @Valid @RequestBody CreateFeeRuleRequest request) {
        return ResponseEntity.ok(service.create(request, user));
    }

    @GetMapping("/rules")
    public List<FeeRule> list(@AuthenticationPrincipal User user, @RequestParam TransactionCategory category) {
        return service.list(category, user);
    }

    @DeleteMapping("/rules/{id}")
    public FeeRule disable(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        return service.disable(id, user);
    }
}
