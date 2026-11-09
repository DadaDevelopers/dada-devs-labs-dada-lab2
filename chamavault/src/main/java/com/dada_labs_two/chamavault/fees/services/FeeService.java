package com.dada_labs_two.chamavault.fees.services;

import com.dada_labs_two.chamavault.fees.dtos.*;
import com.dada_labs_two.chamavault.fees.models.FeeRule;
import com.dada_labs_two.chamavault.fees.repositories.FeeRuleRepository;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.constants.TransactionSource;
import com.dada_labs_two.chamavault.wallets.constants.TransactionType;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import com.dada_labs_two.chamavault.wallets.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.*;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FeeService {
    private static final Logger log = LoggerFactory.getLogger(FeeService.class);
    private final FeeRuleRepository repository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final LightningWalletService lightningWalletService;

    @Value("${fees.collection-wallet-id:}")
    private String collectionWalletId;

    public FeeQuote quote(TransactionCategory category, long amountSats) {
        if (amountSats <= 0) throw new IllegalArgumentException("amountSats must be positive");

        List<FeeRule> rules = repository.findEffective(category, ZonedDateTime.now());
        log.info("Fee rules found of size {}", rules.size());

        if (rules.size() > 1) throw new IllegalStateException("Overlapping active fee rules for " + category);

        if (rules.isEmpty()) return new FeeQuote(category, amountSats, 0, amountSats, BigDecimal.ZERO, null);

        FeeRule rule = rules.getFirst();
        long fee = new BigDecimal(amountSats).multiply(rule.getPercentage())
                .divide(new BigDecimal("100"), 0, RoundingMode.CEILING).longValueExact();

        if (rule.getMinimumFeeSats() != null) fee = Math.max(fee, rule.getMinimumFeeSats());
        if (rule.getMaximumFeeSats() != null) fee = Math.min(fee, rule.getMaximumFeeSats());

        return new FeeQuote(category, amountSats, fee, Math.addExact(amountSats, fee), rule.getPercentage(), rule.getReference());
    }

    public String collect(Wallet payer, FeeQuote quote) {
        if (quote.platformFeeSats() == 0) return null;

        payer.assertTransactionsAllowed();

        log.info("Collecting fees of SATS:{} for category {}", quote.platformFeeSats(), quote.category());

        if (collectionWalletId == null || collectionWalletId.isBlank())
            throw new IllegalStateException("fees.collection-wallet-id is required when a non-zero fee is active");

        Wallet collector = walletRepository.findByIdForUpdate(UUID.fromString(collectionWalletId)).orElseThrow(
                () -> new IllegalStateException("Fee collection wallet not found"));
        collector.assertTransactionsAllowed();

        if (payer.getLightning() == null || payer.getLightning().get("adminkey") == null)
            throw new IllegalStateException("Payer wallet has no Lightning admin key");

        if (lightningWalletService.isOmnibusWallet(payer.getLightning().get("adminkey"))) {
            if (collector.getLightning() == null ||
                    !lightningWalletService.isOmnibusWallet(collector.getLightning().get("inkey"))) {
                throw new IllegalStateException("Blink fees.collection-wallet-id must reference a Blink virtual wallet");
            }
            String reference = "blink-fee:" + UUID.randomUUID();
            transactionRepository.save(Transaction.builder()
                    .wallet(collector)
                    .type(TransactionType.CREDIT)
                    .source(TransactionSource.INTERNAL)
                    .amountSats(quote.platformFeeSats())
                    .category(quote.category())
                    .externalRef(reference)
                    .memo("ChamaVault " + quote.category() + " fee")
                    .occurredAt(ZonedDateTime.now())
                    .build());
            return reference;
        }

        if (collector.getLightning() == null || collector.getLightning().get("inkey") == null)
            throw new IllegalStateException("Fee collection wallet has no Lightning invoice key");

        String invoice = lightningWalletService.createInvoice(collector.getLightning().get("inkey"), quote.platformFeeSats(), "ChamaVault " + quote.category() + " fee");
        return lightningWalletService.payInvoice(payer.getLightning().get("adminkey"), invoice);
    }

    @Transactional
    public FeeRule create(CreateFeeRuleRequest input, User user) {
        assertAdmin(user);

        ZonedDateTime from = input.effectiveFrom() == null ? ZonedDateTime.now() : input.effectiveFrom();

        if (input.effectiveUntil() != null && !input.effectiveUntil().isAfter(from))
            throw new IllegalArgumentException("effectiveUntil must be after effectiveFrom");

        if (input.minimumFeeSats() != null && input.maximumFeeSats() != null && input.minimumFeeSats() > input.maximumFeeSats())
            throw new IllegalArgumentException("minimumFeeSats cannot exceed maximumFeeSats");

        for (FeeRule existing : repository.findByCategoryOrderByEffectiveFromDesc(input.category())) {
            if (!Boolean.TRUE.equals(existing.getActive())) continue;
            boolean overlaps = (existing.getEffectiveUntil() == null || existing.getEffectiveUntil().isAfter(from)) &&
                    (input.effectiveUntil() == null || existing.getEffectiveFrom().isBefore(input.effectiveUntil()));
            if (!overlaps) continue;
            if (existing.getEffectiveFrom().isBefore(from) && (existing.getEffectiveUntil() == null || existing.getEffectiveUntil().isAfter(from))) {
                existing.setEffectiveUntil(from);
                repository.save(existing);
            } else throw new IllegalArgumentException("Fee rule overlaps another scheduled rule");
        }
        return repository.save(FeeRule.builder().category(input.category()).percentage(input.percentage())
                .minimumFeeSats(input.minimumFeeSats()).maximumFeeSats(input.maximumFeeSats()).effectiveFrom(from)
                .effectiveUntil(input.effectiveUntil()).active(true).createdBy(user.getUserReference()).build());
    }

    public List<FeeRule> list(TransactionCategory category, User user) {
        assertAdmin(user);
        return repository.findByCategoryOrderByEffectiveFromDesc(category);
    }

    @Transactional
    public FeeRule disable(UUID id, User user) {
        assertAdmin(user);
        FeeRule rule = repository.findById(id).orElseThrow();
        rule.setActive(false);
        return repository.save(rule);
    }

    private void assertAdmin(User user) {
        if (user == null)
            throw new SecurityException("Authentication required");

        boolean admin = user.getAuthorities() != null && user.getAuthorities().stream().anyMatch(
                a -> a.getAuthority().equalsIgnoreCase("ADMIN") ||
                        a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));

        if (!admin) throw new SecurityException("Platform administrator role required");
    }
}
