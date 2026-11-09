package com.dada_labs_two.chamavault.wallets.services;

import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.repositories.ContributionCycleRepository;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.LnurlPayLinkResponse;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.PaymentFees;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.PayInvoiceResponse;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletDetails;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.payments.exchange.offramp.tando.dtos.LightningPaymentResponse;
import com.dada_labs_two.chamavault.payments.exchange.offramp.tando.services.TandoClient;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.wallets.constants.TransactionSource;
import com.dada_labs_two.chamavault.wallets.constants.TransactionType;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import com.dada_labs_two.chamavault.fees.dtos.FeeQuote;
import com.dada_labs_two.chamavault.fees.services.FeeService;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.dtos.InvoicePreviewDTO;
import com.dada_labs_two.chamavault.wallets.dtos.MakeInvoicePaymentDTO;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.models.specs.TransactionSpecificationBuilder;
import com.dada_labs_two.chamavault.wallets.repositories.TransactionRepository;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import com.dada_labs_two.chamavault.chama.activities.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InvalidObjectException;
import java.time.ZonedDateTime;
import java.util.*;
import com.dada_labs_two.chamavault.payments.constants.TransactionStatus;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {
    private final TandoClient tandoClient;

    private final TransactionRepository transactionRepository;
    private final LightningWalletService lightningWalletService;
    private final ProfileActionService profileActionService;

    private final ContributionCycleRepository cycleRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final FeeService feeService;
    private final ChamaActivityService chamaActivityService;
    private final OmnibusLedgerService omnibusLedgerService;

    @Transactional
    public Transaction makeRotationalPayments(
            Integer contributionCycleReference,
            String msisdn,
            Boolean moveFundsFromPreviousAccounts,
            UUID walletToMoveFundsFrom
    ) {
        ContributionCycle cycle = cycleRepository.findById(contributionCycleReference)
                .orElseThrow();
        log.info("contribution cycle was successfully fetched {}", cycle.getStatus());

        User contributor = userRepository.findByMsisdn(msisdn)
                .orElseThrow();

        String beneficiaryLnUsername = cycle.getBeneficiaryUser().getUser().getUsername()
                .concat("-rotation").concat(cycle.getRotationIndex() +"")
                .toLowerCase()
                .replaceAll("[^a-z0-9_-]", "-");
        String walletPurpose = "contribution lightning address for beneficiary "+ beneficiaryLnUsername;

        Wallet beneficiaryWallet =
                walletRepository.findByWalletPurposeAndOwnerReferenceAndWalletTypeAndChamaAndActive(
                        walletPurpose,
                        cycle.getBeneficiaryUser().getUser().getUserReference(),
                        WalletType.CONTRIBUTION,
                        cycle.getChama(),
                        true
                ).orElseThrow();
        beneficiaryWallet.assertTransactionsAllowed();
        log.info("beneficiary wallet {}", beneficiaryWallet.getWalletPurpose());

        Wallet fundingWallet = null;
        if (moveFundsFromPreviousAccounts) {
            fundingWallet = walletRepository.findById(walletToMoveFundsFrom)
                    .orElseThrow();
            fundingWallet.assertTransactionsAllowed();
        }

        /* ---------------------------------------------------
         * 1. Create contributor contribution wallet
         * --------------------------------------------------- */

        WalletResponse lw = lightningWalletService.createUserWallet(
                beneficiaryWallet.getLightning().get("walletName")
                        + " from " + contributor.getUsername() + "@" + System.currentTimeMillis()
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
                .concat("@" + randomCharGenerator())
                .toLowerCase()
                .replaceAll("[^a-z0-9_-]", "-");

//        LnurlPayLinkResponse lnAddress =
//                lightningWalletService.createLightningAddress(
//                        lw.adminkey(),
//                        "Contribution for rotation " + cycle.getRotationIndex(),
//                        1_000,
//                        1_000_000_000,
//                        0,
//                        lnUsername
//                );
//        log.info("LN address created: {}", lnAddress);
//        lightning.put("lnAddressUrl", lnAddress.lnurl());
//        lightning.put("lnAddressUsername", lnAddress.username());

        Wallet contributorWallet = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CONTRIBUTION)
                        .ownerReference(contributor.getUserReference())
                        .chama(cycle.getChama())
                        .walletPurpose("Contribution for rotation " + cycle.getRotationIndex() + " to " +
                                cycle.getBeneficiaryUser().getUser().getUsername())
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
        FeeQuote platformFee = feeService.quote(TransactionCategory.CHAMA_CONTRIBUTION, amountSats);

        /* ---------- STEP 2.1: fundingWallet → contributorWallet ---------- */

        String contributorInvoice =
                lightningWalletService.createInvoice(
                        contributorWallet.getLightning().get("inkey"),
                        amountSats,
                        "Fund contribution wallet"
                );

        String paymentHash1 =
                lightningWalletService.payInvoice(
                        fundingWallet.getLightning().get("adminkey"),
                        contributorInvoice
                );

        // Ledger: INTERNAL MOVE
        HashMap<String, String> recordInternalMoves = recordInternalMove(
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
                        contributorWallet.getLightning().get("adminkey"),
                        beneficiaryInvoice
                );
        String feePaymentHash = feeService.collect(fundingWallet, platformFee);

        // Update the contribution cycle with the new contribution
        updateContributionCycle(cycle, contributorWallet, amountSats);

        //sync receiver wallet
        syncReceiverLnBitsWalletBalance(cycle.getWallet());
        syncSenderLnBitsWalletBalance(fundingWallet);
        syncSenderLnBitsWalletBalance(contributorWallet);

        //send notification
        User beneficiary = cycle.getBeneficiaryUser().getUser();

        profileActionService.notifyRotationContribution(
                contributor,
                beneficiary,
                cycle,
                amountSats,
                paymentHash2
        );

        profileActionService.notifyRotationContributionReceived(
                beneficiary,
                contributor,
                cycle,
                amountSats,
                paymentHash2
        );

        // Ledger: Lightning payment to beneficiary
        return transactionRepository.save(
                Transaction.builder()
                        .wallet(contributorWallet)
                        .type(TransactionType.DEBIT)
                        .source(TransactionSource.LN_INVOICE)
                        .amountSats(amountSats)
                        .category(TransactionCategory.CHAMA_CONTRIBUTION)
                        .platformFeeSats(platformFee.platformFeeSats())
                        .feeSats(platformFee.platformFeeSats())
                        .feeRuleReference(platformFee.feeRuleReference())
                        .externalRef(paymentHash2)
                        .initiatedBy(contributor.getUserReference())
                        .counterpartyUser(
                                cycle.getBeneficiaryUser().getUser().getUserReference()
                        )
                        .rotationIndex(cycle.getRotationIndex())
                        .memo("Contribution payment")
                        .metadata(withFeeMetadata(recordInternalMoves, platformFee, feePaymentHash))
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );

    }

    public InvoicePreviewDTO invoicePreview(String beneficiaryInvoice, TransactionCategory category) {
        Long amountSats = Bolt11Utils.extractAmountSats(beneficiaryInvoice);
        ZonedDateTime expiry = Bolt11Utils.extractExpiry(beneficiaryInvoice);
        String memo = Bolt11Utils.extractDescription(beneficiaryInvoice).orElse("making payment for invoice");
        FeeQuote fee = feeService.quote(category == null ? TransactionCategory.INVOICE_PAYMENT : category, amountSats);
        return new InvoicePreviewDTO(amountSats, expiry, memo, fee.platformFeeSats(), fee.totalSats(), fee.percentage(), fee.feeRuleReference());
    }

    @Transactional
    public Transaction makeInvoicePayment(UUID payerWalletId, String beneficiaryInvoice, User user) {
        assertWalletOwner(payerWalletId,user);
        return makeInvoicePayment(payerWalletId, beneficiaryInvoice, TransactionCategory.INVOICE_PAYMENT, null, null);
    }

    private Transaction makeInvoicePayment(UUID payerWalletId, String beneficiaryInvoice, TransactionCategory category,
                                           String recipientMsisdn, Long requestedAmountMilliSats) {
        Wallet payerWallet = walletRepository.findById(payerWalletId).orElseThrow(() ->
                new RuntimeException("Payer wallet not found"));

        Long amountSats = Bolt11Utils.extractAmountSats(beneficiaryInvoice);
        FeeQuote platformFee = feeService.quote(category, amountSats);
        String description = Bolt11Utils.extractDescription(beneficiaryInvoice).orElse("making payment for invoice");

        if (omnibusLedgerService.isOmnibus(payerWallet)) {
            payerWallet = omnibusLedgerService.reserve(payerWallet, platformFee.totalSats());
        }

        PayInvoiceResponse payment =
                lightningWalletService.payInvoiceWithStatus(
                        payerWallet.getLightning().get("adminkey"),
                        beneficiaryInvoice
                );
        String paymentHash2 = payment.payment_hash();
        log.info("beneficiary invoice payment hash {}", paymentHash2);
        Map<String,String> metadata = new HashMap<>();
        metadata.put("paymentHash", paymentHash2);
        metadata.put("paymentState", Boolean.TRUE.equals(payment.paid()) ? "PAID_AWAITING_RECONCILIATION" : "PENDING");
        if (recipientMsisdn != null) metadata.put("recipientMsisdn", recipientMsisdn);
        if (requestedAmountMilliSats != null) metadata.put("requestedAmountMilliSats", requestedAmountMilliSats.toString());
        if (platformFee.feeRuleReference() != null) metadata.put("feeRuleReference", platformFee.feeRuleReference().toString());
        if (omnibusLedgerService.isOmnibus(payerWallet)) metadata.put("omnibusReservedSats", String.valueOf(platformFee.totalSats()));

        // Persist initiation immediately. Final fee, notification and SETTLED state are handled by reconciliation.
        return transactionRepository.save(
                Transaction.builder()
                        .wallet(payerWallet)
                        .type(TransactionType.DEBIT)
                        .source(TransactionSource.LN_INVOICE)
                        .amountSats(amountSats)
                        .category(category)
                        .externalRef(paymentHash2)
                        .networkFeeSats(null)
                        .platformFeeSats(platformFee.platformFeeSats())
                        .feeSats(null)
                        .feeRuleReference(platformFee.feeRuleReference())
                        .status(TransactionStatus.PENDING)
                        .checkingId(payment.checking_id())
                        .statusCheckCount(0)
                        .initiatedBy(null)
                        .counterpartyUser(
                                payerWallet.getOwnerReference()
                        )
                        .rotationIndex(null)
                        .memo(description)
                        .metadata(metadata)
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );
    }

    @Transactional
    public Transaction initiateOffRampingLightningPayment(
            String recipientMsisdn,
            Long amountInMilliSats,
            UUID payerWalletId,
            User user) throws InvalidObjectException {
        log.info("initiateOffRampingLightningPayment process");

        if (recipientMsisdn == null || (recipientMsisdn.length() != 10 && recipientMsisdn.length() != 12))
            throw new InvalidObjectException("invalid phone number");
        log.info("recipientMsisdn {}", recipientMsisdn);

        Wallet payerWallet = assertWalletOwner(payerWalletId,user);

        LightningPaymentResponse response = tandoClient.createOffRampingLightningPayment
                (recipientMsisdn, amountInMilliSats);
        log.info("LightningPaymentResponse response {}", response);
        if (response.pr().isBlank())
            throw new RuntimeException("created invoice is blank");

        return makeInvoicePayment(payerWalletId, response.pr(), TransactionCategory.WITHDRAWAL,
                recipientMsisdn, amountInMilliSats);
    }

    public Transaction updateTransaction(Transaction transaction) {
        log.info("Updating transaction: " + transaction.toString());
        return transactionRepository.save(transaction);
    }

    public Transaction findById(UUID reference,User user){
        Transaction tx=transactionRepository.findById(reference).orElseThrow(()->new IllegalArgumentException("Transaction not found"));
        if(user==null||!tx.getWallet().getOwnerReference().equals(user.getUserReference()))throw new SecurityException("Transaction is not owned by the authenticated user");
        return tx;
    }

    private Wallet assertWalletOwner(UUID walletId,User user){
        Wallet wallet=walletRepository.findByIdForUpdate(walletId).orElseThrow(()->new IllegalArgumentException("Payer wallet not found"));
        if(user==null||!wallet.getOwnerReference().equals(user.getUserReference()))throw new SecurityException("Payer wallet is not owned by the authenticated user");
        wallet.assertTransactionsAllowed();
        return wallet;
    }

    public  static String randomCharGenerator() {
        char[] chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789".toCharArray();
        int max=100000000;
        int random=(int) (Math.random()*max);
        StringBuffer sb=new StringBuffer();

        while (random>0)
        {
            sb.append(chars[random % chars.length]);
            random /= chars.length;
        }

        return "VAULT-WALLET-" + sb.toString();
    }

    @Transactional
    public Transaction topUpAWallet(UUID senderWalletId, UUID recipientWalletId, Long amountSats, String memo) {
        Map<UUID, Wallet> lockedWallets = walletRepository.findAllByIdForUpdate(List.of(senderWalletId, recipientWalletId))
                .stream().collect(java.util.stream.Collectors.toMap(Wallet::getWalletReference, w -> w));
        Wallet senderWallet = Optional.ofNullable(lockedWallets.get(senderWalletId))
                .orElseThrow(() -> new RuntimeException("Sender wallet not found"));
        senderWallet.assertTransactionsAllowed();

        if (senderWallet.getWalletType() == WalletType.CHAMA_GROUP)
            throw new RuntimeException("Withdrawal may not be permitted on CHAMA_GROUP wallets");

        Wallet recipientWallet = Optional.ofNullable(lockedWallets.get(recipientWalletId))
                .orElseThrow(() -> new RuntimeException("Recipient wallet not found"));
        recipientWallet.assertTransactionsAllowed();
        FeeQuote platformFee = feeService.quote(TransactionCategory.WALLET_TRANSFER, amountSats);

        //create invoice on behalf of recipient, then make a payment on behalf of sender
        String recipientInvoice =
                lightningWalletService.createInvoice(
                        recipientWallet.getLightning().get("inkey"),
                        amountSats,
                        memo
                );
        log.info("invoice successfully created for recipient wallet {}", recipientWalletId);

        String paymentHash2 =
                lightningWalletService.payInvoice(
                        senderWallet.getLightning().get("adminkey"),
                        recipientInvoice
                );
        String feePaymentHash = feeService.collect(senderWallet, platformFee);
        log.info("paymentHash2 successfully created for senderWallet wallet {}", senderWallet.getLightning().get("adminkey"));

        Map<String, String> transferMetadata = new HashMap<>();
        transferMetadata.put("paymentHash", paymentHash2);
        transferMetadata.put("senderWalletReference", senderWallet.getWalletReference().toString());
        transferMetadata.put("recipientWalletReference", recipientWallet.getWalletReference().toString());

        //Sync Wallets
        syncReceiverLnBitsWalletBalance(senderWallet);
        syncSenderLnBitsWalletBalance(recipientWallet);

        // Ledger DT: Lightning payment to beneficiary
         Transaction creditTransaction = transactionRepository.save(
                Transaction.builder()
                        .wallet(recipientWallet)
                        .type(TransactionType.CREDIT)
                        .source(TransactionSource.LN_INVOICE)
                        .amountSats(amountSats)
                        .category(TransactionCategory.WALLET_TRANSFER)
                        .externalRef(paymentHash2 + "-CREDIT")
                        .initiatedBy(senderWallet.getOwnerReference())
                        .counterpartyUser(recipientWallet.getOwnerReference())
                        .rotationIndex(null)
                        .memo(memo)
                        .metadata(new HashMap<>(transferMetadata))
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );

        // Ledger: Lightning payment to beneficiary
         Transaction debitTransaction = transactionRepository.save(
                Transaction.builder()
                        .wallet(senderWallet)
                        .type(TransactionType.DEBIT)
                        .source(TransactionSource.LN_INVOICE)
                        .amountSats(amountSats)
                        .category(TransactionCategory.WALLET_TRANSFER)
                        .platformFeeSats(platformFee.platformFeeSats())
                        .feeSats(platformFee.platformFeeSats())
                        .feeRuleReference(platformFee.feeRuleReference())
                        .externalRef(paymentHash2 + "-DEBIT")
                        .initiatedBy(senderWallet.getOwnerReference())
                        .counterpartyUser(recipientWallet.getOwnerReference())
                        .rotationIndex(null)
                        .memo(memo)
                        .metadata(withFeeMetadata(new HashMap<>(transferMetadata), platformFee, feePaymentHash))
                        .occurredAt(ZonedDateTime.now())
                        .build()
        );
        var activityChama = recipientWallet.getChama() != null ? recipientWallet.getChama() : senderWallet.getChama();
        if (activityChama != null) {
            transferMetadata.put("creditTransactionReference", creditTransaction.getTransactionReference().toString());
            transferMetadata.put("debitTransactionReference", debitTransaction.getTransactionReference().toString());
            User actor = userRepository.findById(senderWallet.getOwnerReference()).orElse(null);
            chamaActivityService.record(activityChama, actor, ChamaActivityType.WALLET_TOPPED_UP,
                    ActivityCategory.WALLET, "Chama wallet topped up",
                    (actor == null ? "A member" : actor.getUsername()) + " transferred " + amountSats + " sats to a chama wallet",
                    "TRANSACTION", debitTransaction.getTransactionReference().toString(), amountSats,
                    recipientWallet.getWalletReference(), debitTransaction.getTransactionReference(), null,
                    "WALLET_TOPPED_UP:" + paymentHash2, transferMetadata);
        }
        return debitTransaction;
    }

    /**
     * Updates the contribution cycle with a new contribution
     * @param cycle The contribution cycle to update
     * @param contributorWallet The wallet that made the contribution
     * @param amount The amount contributed in sats
     */
    private void updateContributionCycle(ContributionCycle cycle, Wallet contributorWallet, long amount) {
        // Update the total contribution amount
        cycle.setCurrentTotalContributionAmount(
                cycle.getCurrentTotalContributionAmount() + amount
        );

        // Add the contributor's wallet to the list if not already present
        if (!cycle.getContributorWallets().contains(contributorWallet)) {
            cycle.getContributorWallets().add(contributorWallet);
            log.info(
                    "Added contributor {} to cycle {}",
                    contributorWallet.getWalletReference(),
                    cycle.getCycleReference()
            );
        }

        cycleRepository.save(cycle);

        log.info(
                "Updated cycle {} with new contribution of {} sats. Total: {} sats",
                cycle.getCycleReference(),
                amount,
                cycle.getCurrentTotalContributionAmount()
        );
    }

    void syncReceiverLnBitsWalletBalance(Wallet wallet) {
        syncWithLnBitsWalletBalance(wallet);
    }

    void syncSenderLnBitsWalletBalance(Wallet wallet) {
        syncWithLnBitsWalletBalance(wallet);
    }

    void syncWithLnBitsWalletBalance(Wallet wallet) {
        if (omnibusLedgerService.isOmnibus(wallet)) {
            omnibusLedgerService.refresh(wallet);
            return;
        }
        WalletDetails walletDetails = lightningWalletService.getUserWallet(wallet.getLightning().get("inkey"));

        log.info("getLnBitsbalanceSats() wallet balance current {}",wallet.getLnBitsbalanceSats());
        log.info("wallet balance from LnBits {}", walletDetails.balance());

        log.info("proceeding to update");
        wallet.setLnBitsbalanceSats(walletDetails.balance());
        wallet.setBalanceSats(walletDetails.balance()/1000);
        walletRepository.save(wallet);
    }


    private HashMap<String, String> recordInternalMove(
            Wallet from,
            Wallet to,
            long amount,
            String paymentHash,
            User user,
            ContributionCycle cycle
    ) {
        Transaction internalMoveDebit = transactionRepository.save(
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

        Transaction internalMoveCredit = transactionRepository.save(
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

        HashMap<String, String> recordInternalMoves = new HashMap<>();
        recordInternalMoves.put("INTERNAL_MOVE_CREDIT", internalMoveCredit.getTransactionReference().toString());
        recordInternalMoves.put("INTERNAL_MOVE_DEBIT", internalMoveDebit.getTransactionReference().toString());
        return  recordInternalMoves;
    }


    public Page<Transaction> findByRotationIndex(Integer rotationIndex, Pageable pageable) {
        return transactionRepository.findByRotationIndex(rotationIndex, pageable);
    }

    public Page<Transaction> searchTransactions(Map<String, String> filters, Pageable page) {
        Specification<Transaction> spec = TransactionSpecificationBuilder.build(filters);
        return transactionRepository.findAll(spec, page);
    }

    private Map<String,String> withFeeMetadata(Map<String,String> metadata, FeeQuote fee, String feePaymentHash) {
        metadata.put("platformFeeSats", String.valueOf(fee.platformFeeSats()));
        metadata.put("feePercentage", fee.percentage().toPlainString());
        if (fee.feeRuleReference() != null) metadata.put("feeRuleReference", fee.feeRuleReference().toString());
        if (feePaymentHash != null) metadata.put("feePaymentHash", feePaymentHash);
        return metadata;
    }
}
