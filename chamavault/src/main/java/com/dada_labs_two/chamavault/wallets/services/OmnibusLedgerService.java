package com.dada_labs_two.chamavault.wallets.services;

import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.TransactionRepository;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OmnibusLedgerService {
    private final WalletRepository wallets;
    private final TransactionRepository transactions;
    private final LightningWalletService lightning;

    public boolean isOmnibus(Wallet wallet) {
        return wallet != null && wallet.getLightning() != null &&
                lightning.isOmnibusWallet(wallet.getLightning().get("inkey"));
    }

    @Transactional
    public Wallet reserve(Wallet wallet, long sats) {
        if (!isOmnibus(wallet)) return wallet;
        Wallet locked = wallets.findByIdForUpdate(wallet.getWalletReference()).orElseThrow();
        long available = locked.getBalanceSats() == null ? 0L : locked.getBalanceSats();
        if (sats <= 0) throw new IllegalArgumentException("Reservation must be positive");
        if (available < sats) throw new IllegalStateException("Insufficient ChamaVault wallet balance");
        locked.setBalanceSats(available - sats);
        return wallets.save(locked);
    }

    @Transactional
    public Wallet refresh(Wallet wallet) {
        if (!isOmnibus(wallet)) return wallet;
        Wallet locked = wallets.findByIdForUpdate(wallet.getWalletReference()).orElseThrow();
        Long balance = transactions.sumBalanceByWallet(locked);
        locked.setBalanceSats(balance == null ? 0L : balance);
        return wallets.save(locked);
    }
}
