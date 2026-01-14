package com.dada_labs_two.chamavault.contributions.services;

import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.PaymentStatus;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.wallets.constants.TransactionSource;
import com.dada_labs_two.chamavault.wallets.constants.TransactionType;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.TransactionRepository;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/* What It does

For each active wallet:
Fetch last LNbits payments
For each payment:
Skip if already recorded (payment_hash)
Create a Transaction
Recompute wallet balance from ledger
Update wallet snapshot
It never moves money
It never applies business rules
 */

@Component
@RequiredArgsConstructor
@Slf4j
public class WalletBalancePoller {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final LightningWalletService lightningWalletService;

    @Scheduled(fixedDelayString = "${wallet.poller.delay-ms:30000}")
    @Transactional
    public void pollWalletBalances() {

        List<Wallet> wallets = walletRepository.findByActiveTrue();

        for (Wallet wallet : wallets) {
            try {
                pollSingleWallet(wallet);
            } catch (Exception e) {
                log.error(
                        "Failed polling wallet {}: {}",
                        wallet.getWalletReference(),
                        e.getMessage(),
                        e
                );
            }
        }
    }

    private void pollSingleWallet(Wallet wallet) {

        String walletKey = wallet.getLightning().get("inkey");
        if (walletKey == null) {
            log.warn("Wallet {} has no inkey", wallet.getWalletReference());
            return;
        }

        List<PaymentStatus> payments =
                lightningWalletService.listPayments(walletKey);

        for (PaymentStatus payment : payments) {

            String paymentHash = payment.payment_hash();

            // Idempotency guard
            if (transactionRepository.existsByExternalRef(paymentHash)) {
                continue;
            }

            long amountSats = Math.abs(payment.amount()) / 1000;

            TransactionType type =
                    payment.out()
                            ? TransactionType.DEBIT
                            : TransactionType.CREDIT;

            TransactionSource source =
                    payment.bolt11() != null
                            ? TransactionSource.LN_INVOICE
                            : TransactionSource.LNURL_PAY;

            Transaction tx = Transaction.builder()
                    .wallet(wallet)
                    .type(type)
                    .source(source)
                    .amountSats(amountSats)
                    .externalRef(paymentHash)
                    .memo(payment.memo())
                    .occurredAt(payment.time())
                    .build();

            transactionRepository.save(tx);

            log.info(
                    "Recorded {} {} sats for wallet {} (hash={})",
                    type,
                    amountSats,
                    wallet.getWalletReference(),
                    paymentHash
            );
        }

        refreshWalletBalance(wallet);
    }

    private void refreshWalletBalance(Wallet wallet) {

        Long balance =
                transactionRepository.sumBalanceByWallet(wallet);

        wallet.setBalanceSats(balance != null ? balance : 0L);

        walletRepository.save(wallet);
    }
}


