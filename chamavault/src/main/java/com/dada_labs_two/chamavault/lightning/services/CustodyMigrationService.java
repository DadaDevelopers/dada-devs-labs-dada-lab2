package com.dada_labs_two.chamavault.lightning.services;

import com.dada_labs_two.chamavault.lightning.LightningProviderType;
import com.dada_labs_two.chamavault.lightning.constants.CustodyMigrationStatus;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.*;
import com.dada_labs_two.chamavault.lightning.integration.blink.BlinkClient;
import com.dada_labs_two.chamavault.lightning.models.*;
import com.dada_labs_two.chamavault.lightning.repositories.*;
import com.dada_labs_two.chamavault.payments.constants.TransactionStatus;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.InvoiceRepository;
import com.dada_labs_two.chamavault.wallets.constants.InvoiceStatus;
import com.dada_labs_two.chamavault.wallets.constants.WalletOperationalStatus;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CustodyMigrationService {
    private static final Set<TransactionStatus> UNSETTLED = EnumSet.of(
            TransactionStatus.CREATED, TransactionStatus.PENDING, TransactionStatus.PROCESSING);

    private final WalletRepository wallets;
    private final TransactionRepository transactions;
    private final InvoiceRepository invoices;
    private final WalletProviderBindingRepository bindings;
    private final CustodyMigrationRepository migrations;
    private final BlinkClient blink;

    @Transactional
    public MigrationView prepare(Collection<UUID> walletReferences, User admin) {
        assertAdmin(admin);
        if (walletReferences == null || walletReferences.isEmpty()) {
            throw new IllegalArgumentException("At least one walletReference is required");
        }
        List<UUID> distinctIds = walletReferences.stream().distinct().sorted().toList();
        List<Wallet> selected = wallets.findAllByIdForUpdate(distinctIds);
        if (selected.size() != distinctIds.size()) throw new IllegalArgumentException("One or more wallets do not exist");

        long total = 0;
        for (Wallet wallet : selected) {
            if (wallet.getOperationalStatus() != null && wallet.getOperationalStatus() != WalletOperationalStatus.ACTIVE)
                throw new IllegalStateException("Wallet " + wallet.getWalletReference() + " is not ACTIVE");
            if (wallet.getLightning() == null || wallet.getLightning().get("inkey") == null ||
                    wallet.getLightning().get("inkey").startsWith(BlinkClient.REFERENCE_PREFIX))
                throw new IllegalStateException("Wallet " + wallet.getWalletReference() + " is not an LNbits wallet");
            if (transactions.existsByWalletAndStatusIn(wallet, UNSETTLED))
                throw new IllegalStateException("Wallet " + wallet.getWalletReference() + " has unsettled transactions");
            if (invoices.existsByInvoicerCreatorAndStatusAndExpiresAtAfter(
                    wallet, InvoiceStatus.PENDING, ZonedDateTime.now()))
                throw new IllegalStateException("Wallet " + wallet.getWalletReference() + " has an unexpired incoming invoice");
            total = Math.addExact(total, Optional.ofNullable(wallet.getBalanceSats()).orElse(0L));
            wallet.setOperationalStatus(WalletOperationalStatus.MIGRATION_LOCKED);
        }
        if (total <= 0) throw new IllegalStateException("Migration total must be positive");
        wallets.saveAll(selected);

        InvoiceResponse fundingInvoice = blink.createInvoice(total, "ChamaVault LNbits to Blink custody migration");
        CustodyMigration migration = CustodyMigration.builder()
                .sourceProvider(LightningProviderType.LNBITS)
                .destinationProvider(LightningProviderType.BLINK)
                .status(CustodyMigrationStatus.AWAITING_FUNDING)
                .expectedSats(total)
                .fundedSats(0L)
                .fundingPaymentHash(fundingInvoice.payment_hash())
                .fundingInvoice(fundingInvoice.payment_request())
                .initiatedBy(admin.getUserReference())
                .build();

        for (Wallet wallet : selected) {
            WalletProviderBinding source = bindings.findByWalletAndActiveTrue(wallet).orElseGet(() ->
                    bindings.save(WalletProviderBinding.builder()
                            .wallet(wallet)
                            .provider(LightningProviderType.LNBITS)
                            .providerWalletReference(wallet.getLightning().get("id"))
                            .providerMetadata(new HashMap<>(wallet.getLightning()))
                            .active(true)
                            .build()));
            WalletResponse virtual = blink.createVirtualWallet(wallet.getWalletPurpose() == null
                    ? "wallet-" + wallet.getWalletReference() : wallet.getWalletPurpose());
            Map<String, String> destinationMetadata = walletMetadata(virtual);
            WalletProviderBinding destination = bindings.save(WalletProviderBinding.builder()
                    .wallet(wallet)
                    .provider(LightningProviderType.BLINK)
                    .providerWalletReference(virtual.id())
                    .providerMetadata(destinationMetadata)
                    .active(false)
                    .build());
            CustodyMigrationWallet item = CustodyMigrationWallet.builder()
                    .migration(migration)
                    .wallet(wallet)
                    .snapshotBalanceSats(Optional.ofNullable(wallet.getBalanceSats()).orElse(0L))
                    .sourceBindingReference(source.getBindingReference())
                    .destinationBindingReference(destination.getBindingReference())
                    .build();
            migration.getWallets().add(item);
        }
        return view(migrations.save(migration));
    }

    @Transactional
    public MigrationView refreshFunding(UUID reference, User admin) {
        assertAdmin(admin);
        CustodyMigration migration = migrations.findByIdForUpdate(reference).orElseThrow();
        if (migration.getStatus() == CustodyMigrationStatus.COMPLETED) return view(migration);
        if (migration.getStatus() != CustodyMigrationStatus.AWAITING_FUNDING &&
                migration.getStatus() != CustodyMigrationStatus.READY_TO_FINALIZE)
            throw new IllegalStateException("Migration cannot check funding in status " + migration.getStatus());
        PaymentStatus status = blink.getPayment(migration.getFundingPaymentHash());
        if (Boolean.TRUE.equals(status.paid())) {
            migration.setFundedSats(migration.getExpectedSats());
            migration.setStatus(CustodyMigrationStatus.READY_TO_FINALIZE);
        } else if (Set.of("failed", "expired").contains(status.status().toLowerCase(Locale.ROOT))) {
            migration.setStatus(CustodyMigrationStatus.FAILED);
            migration.setFailureReason("Blink funding invoice status: " + status.status());
            unlock(migration, WalletOperationalStatus.MIGRATION_FAILED);
        }
        return view(migrations.save(migration));
    }

    @Transactional
    public MigrationView finalizeMigration(UUID reference, User admin) {
        assertAdmin(admin);
        CustodyMigration migration = migrations.findByIdForUpdate(reference).orElseThrow();
        if (migration.getStatus() == CustodyMigrationStatus.COMPLETED) return view(migration);
        if (migration.getStatus() != CustodyMigrationStatus.READY_TO_FINALIZE)
            throw new IllegalStateException("Funding must be confirmed before finalization");
        if (!Objects.equals(migration.getExpectedSats(), migration.getFundedSats()))
            throw new IllegalStateException("Confirmed backing does not match snapshotted liabilities");

        for (CustodyMigrationWallet item : migration.getWallets()) {
            Wallet wallet = wallets.findByIdForUpdate(item.getWallet().getWalletReference()).orElseThrow();
            if (wallet.getOperationalStatus() != WalletOperationalStatus.MIGRATION_LOCKED)
                throw new IllegalStateException("Wallet migration lock was lost: " + wallet.getWalletReference());
            if (!Objects.equals(wallet.getBalanceSats(), item.getSnapshotBalanceSats()))
                throw new IllegalStateException("Wallet balance changed after snapshot: " + wallet.getWalletReference());

            WalletProviderBinding source = bindings.findById(item.getSourceBindingReference()).orElseThrow();
            WalletProviderBinding destination = bindings.findById(item.getDestinationBindingReference()).orElseThrow();
            source.setActive(false);
            source.setDeactivatedAt(ZonedDateTime.now());
            destination.setActive(true);
            bindings.save(source);
            bindings.save(destination);

            wallet.setLightning(new HashMap<>(destination.getProviderMetadata()));
            wallet.setOperationalStatus(WalletOperationalStatus.ACTIVE);
            wallet.setActive(true);
            wallets.save(wallet);
        }
        migration.setStatus(CustodyMigrationStatus.COMPLETED);
        migration.setCompletedAt(ZonedDateTime.now());
        return view(migrations.save(migration));
    }

    @Transactional
    public MigrationView cancel(UUID reference, User admin) {
        assertAdmin(admin);
        CustodyMigration migration = migrations.findByIdForUpdate(reference).orElseThrow();
        if (migration.getStatus() == CustodyMigrationStatus.READY_TO_FINALIZE)
            throw new IllegalStateException("A funded migration cannot be cancelled; finalize or perform a reviewed refund");
        if (migration.getStatus() == CustodyMigrationStatus.COMPLETED)
            throw new IllegalStateException("Completed migration cannot be cancelled");
        unlock(migration, WalletOperationalStatus.ACTIVE);
        migration.setStatus(CustodyMigrationStatus.CANCELLED);
        return view(migrations.save(migration));
    }

    @Transactional(readOnly = true)
    public MigrationView get(UUID reference, User admin) {
        assertAdmin(admin);
        return view(migrations.findById(reference).orElseThrow());
    }

    private void unlock(CustodyMigration migration, WalletOperationalStatus status) {
        for (CustodyMigrationWallet item : migration.getWallets()) {
            Wallet wallet = wallets.findByIdForUpdate(item.getWallet().getWalletReference()).orElseThrow();
            wallet.setOperationalStatus(status);
            wallets.save(wallet);
        }
    }

    private Map<String, String> walletMetadata(WalletResponse wallet) {
        Map<String, String> map = new HashMap<>();
        put(map, "id", wallet.id()); put(map, "name", wallet.name());
        put(map, "walletName", wallet.name()); put(map, "adminkey", wallet.adminkey());
        put(map, "invoice_key", wallet.invoice_key()); put(map, "wallet_type", wallet.wallet_type());
        put(map, "inkey", wallet.inkey()); put(map, "shared_wallet_id", wallet.shared_wallet_id());
        put(map, "currency", wallet.currency()); put(map, "balance_msat", wallet.balance_msat());
        map.put("provider", LightningProviderType.BLINK.name());
        return map;
    }

    private void put(Map<String, String> map, String key, String value) {
        if (value != null) map.put(key, value);
    }

    private MigrationView view(CustodyMigration migration) {
        List<WalletSnapshot> snapshots = migration.getWallets().stream()
                .map(i -> new WalletSnapshot(i.getWallet().getWalletReference(), i.getSnapshotBalanceSats()))
                .toList();
        return new MigrationView(migration.getMigrationReference(), migration.getSourceProvider(),
                migration.getDestinationProvider(), migration.getStatus(), migration.getExpectedSats(),
                migration.getFundedSats(), migration.getFundingPaymentHash(), migration.getFundingInvoice(),
                migration.getFailureReason(), migration.getCreatedAt(), migration.getCompletedAt(), snapshots);
    }

    private void assertAdmin(User user) {
        if (user == null || user.getAuthorities() == null || user.getAuthorities().stream().noneMatch(a ->
                a.getAuthority().equalsIgnoreCase("ADMIN") || a.getAuthority().equalsIgnoreCase("ROLE_ADMIN")))
            throw new SecurityException("Platform administrator role required");
    }

    public record WalletSnapshot(UUID walletReference, long balanceSats) {}
    public record MigrationView(UUID migrationReference, LightningProviderType sourceProvider,
                                LightningProviderType destinationProvider, CustodyMigrationStatus status,
                                long expectedSats, long fundedSats, String fundingPaymentHash,
                                String fundingInvoice, String failureReason, ZonedDateTime createdAt,
                                ZonedDateTime completedAt, List<WalletSnapshot> wallets) {}
}
