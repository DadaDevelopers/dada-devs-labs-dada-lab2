package com.dada_labs_two.chamavault.wallets.services;

import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.repositories.ContributionCycleRepository;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.LnurlPayLinkResponse;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletDetails;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.wallets.constants.TransactionSource;
import com.dada_labs_two.chamavault.wallets.constants.TransactionType;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.TransactionRepository;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final LightningWalletService lightningWalletService;

    private final ContributionCycleRepository cycleRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Transactional
    public Transaction makeRotationalPayments(
            Integer contributionCycleReference,
            String msisdn,
            Boolean moveFundsFromPreviousAccounts,
            UUID walletToMoveFundsFrom
    ) {
        ContributionCycle cycle = cycleRepository.findById(contributionCycleReference)
                .orElseThrow();

        User contributor = userRepository.findByMsisdn(msisdn)
                .orElseThrow();

        Wallet beneficiaryWallet =
                walletRepository.findByOwnerReferenceAndWalletTypeAndChamaAndActive(
                        cycle.getBeneficiaryUser().getUser().getUserReference(),
                        WalletType.CONTRIBUTION,
                        cycle.getChama(),
                        true
                ).orElseThrow();

        Wallet fundingWallet = null;
        if (moveFundsFromPreviousAccounts) {
            fundingWallet = walletRepository.findById(walletToMoveFundsFrom)
                    .orElseThrow();
        }

        /* ---------------------------------------------------
         * 1. Create contributor contribution wallet
         * --------------------------------------------------- */

        WalletResponse lw = lightningWalletService.createUserWallet(
                beneficiaryWallet.getLightning().get("walletName")
                        + " from " + contributor.getUsername()
        );
        log.info("LW created user wallet: {}", lw);

        Map<String, String> lightning = new HashMap<>();
        lightning.put("id", lw.id());
        lightning.put("name", lw.name());
        lightning.put("adminkey", lw.adminkey());
        lightning.put("invoice_key", lw.invoice_key());
        lightning.put("wallet_type", lw.wallet_type());
        lightning.put("inkey", lw.inkey());
        lightning.put("shared_wallet_id", lw.shared_wallet_id());
        lightning.put("currency", lw.currency());
        lightning.put("balance_msat", lw.balance_msat());

        String lnUsername = contributor.getUsername()
                .concat("-rotation-")
                .concat(cycle.getRotationIndex() + "-contribution")
                .toLowerCase()
                .replaceAll("[^a-z0-9_-]", "-");

        LnurlPayLinkResponse lnAddress =
                lightningWalletService.createLightningAddress(
                        lw.adminkey(),
                        "Contribution for rotation " + cycle.getRotationIndex(),
                        1_000,
                        1_000_000_000,
                        0,
                        lnUsername
                );
        log.info("LN address created: {}", lnAddress);
        lightning.put("lnAddressUrl", lnAddress.lnurl());
        lightning.put("lnAddressUsername", lnAddress.username());

        Wallet contributorWallet = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CONTRIBUTION)
                        .ownerReference(contributor.getUserReference())
                        .chama(cycle.getChama())
                        .lightning(lightning)
                        .balanceSats(0L)
                        .active(true)
                        .build()
        );

        /* ---------------------------------------------------
         * 2. If funding wallet exists → execute payments
         * --------------------------------------------------- */

        if (fundingWallet == null) {
            return null; // user will pay manually later
        }

        long amountSats = cycle.getContributionAmount();

        /* ---------- STEP 2.1: fundingWallet → contributorWallet ---------- */

        String contributorInvoice =
                lightningWalletService.createInvoice(
                        contributorWallet.getLightning().get("inkey"),
                        amountSats,
                        "Fund contribution wallet"
                );

        String paymentHash1 =
                lightningWalletService.payInvoice(
                        fundingWallet.getLightning().get("inkey"),
                        contributorInvoice
                );

        // Ledger: INTERNAL MOVE
        recordInternalMove(
                fundingWallet,
                contributorWallet,
                amountSats,
                paymentHash1,
                contributor,
                cycle
        );

        /* ---------- STEP 2.2: contributorWallet → beneficiaryWallet ---------- */

        String beneficiaryInvoice =
                lightningWalletService.createInvoice(
                        beneficiaryWallet.getLightning().get("inkey"),
                        amountSats,
                        "Rotation " + cycle.getRotationIndex() + " contribution"
                );

        String paymentHash2 =
                lightningWalletService.payInvoice(
                        contributorWallet.getLightning().get("inkey"),
                        beneficiaryInvoice
                );

        // Ledger: Lightning payment to beneficiary
        return transactionRepository.save(
                Transaction.builder()
                        .wallet(contributorWallet)
                        .type(TransactionType.DEBIT)
                        .source(TransactionSource.LN_INVOICE)
                        .amountSats(amountSats)
                        .externalRef(paymentHash2)
                        .initiatedBy(contributor.getUserReference())
                        .counterpartyUser(
                                cycle.getBeneficiaryUser().getUser().getUserReference()
                        )
                        .rotationIndex(cycle.getRotationIndex())
                        .memo("Contribution payment")
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );

    }


    private void recordInternalMove(
            Wallet from,
            Wallet to,
            long amount,
            String paymentHash,
            User user,
            ContributionCycle cycle
    ) {
        transactionRepository.save(
                Transaction.builder()
                        .wallet(from)
                        .type(TransactionType.DEBIT)
                        .source(TransactionSource.INTERNAL)
                        .amountSats(amount)
                        .externalRef(paymentHash + "-DEBIT")
                        .initiatedBy(user.getUserReference())
                        .rotationIndex(cycle.getRotationIndex())
                        .memo("Internal allocation")
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );

        transactionRepository.save(
                Transaction.builder()
                        .wallet(to)
                        .type(TransactionType.CREDIT)
                        .source(TransactionSource.INTERNAL)
                        .amountSats(amount)
                        .externalRef(paymentHash + "-CREDIT")
                        .initiatedBy(user.getUserReference())
                        .rotationIndex(cycle.getRotationIndex())
                        .memo("Internal allocation")
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );
    }


    public Page<Transaction> findByRotationIndex(Integer rotationIndex, Pageable pageable) {
        return transactionRepository.findByRotationIndex(rotationIndex, pageable);
    }
}
