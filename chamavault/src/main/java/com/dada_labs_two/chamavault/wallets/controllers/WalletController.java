package com.dada_labs_two.chamavault.wallets.controllers;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.wallets.dtos.CreateWalletDTO;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;

    @PostMapping
    ResponseEntity<Wallet> createWallet(@RequestBody CreateWalletDTO createWalletDTO) {
        return ResponseEntity.ok(walletService.createWallet(createWalletDTO));
    }

    @GetMapping("/{ownerReference}")
    ResponseEntity<Page<Wallet>> getWallet(@PathVariable("ownerReference") UUID ownerReference, Pageable pageable) {
        return ResponseEntity.ok(walletService.findAllByOwnerReference(pageable, ownerReference));
    }
}
