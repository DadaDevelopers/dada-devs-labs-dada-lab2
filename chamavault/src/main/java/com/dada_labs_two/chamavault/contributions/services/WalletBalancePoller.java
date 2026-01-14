//package com.dada_labs_two.chamavault.contributions.services;
//
//import com.dada_labs_two.chamavault.lightning.integration.LNbits.LNbitsClient;
//import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.PaymentStatus;
//import com.dada_labs_two.chamavault.wallets.models.Wallet;
//import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class WalletBalancePoller {
//
//    private final LNbitsClient client;
//    private final WalletRepository walletRepo;
//    private final ContributionService contributionService;
//
//    @Scheduled(fixedDelay = 10_000)
//    @Transactional
//    public void pollContributionWallets() {
//        log.info("Polling contribution wallets");
//
//        List<Wallet> wallets =
//                walletRepo.findActiveContributionWallets();
//
//        for (Wallet wallet : wallets) {
//
//            String walletKey = wallet.getLightning().get("inkey");
//
//            // 1. Fetch payments
//            List<PaymentStatus> payments =
//                    client.listPayments(walletKey);
//
//            for (PaymentStatus payment : payments) {
//
//                // skip outgoing or unpaid
//                if (!payment.paid() || payment.amount() <= 0) continue;
//
//                // already processed?
//                if (wallet.hasProcessed(payment.payment_hash())) continue;
//
//                // 2. Process contribution
//                contributionService.applyContribution(
//                        wallet,
//                        payment.payment_hash(),
//                        payment.amount() / 1000 // sats
//                );
//
//                // 3. Mark as processed
//                wallet.markPaymentProcessed(payment.payment_hash());
//            }
//
//            // 4. Update snapshot balance (optional but recommended)
//            WalletDetails details = client.getWallet(walletKey);
//            wallet.setBalanceSats(details.balance() / 1000);
//
//            walletRepo.save(wallet);
//        }
//    }
//}
//
