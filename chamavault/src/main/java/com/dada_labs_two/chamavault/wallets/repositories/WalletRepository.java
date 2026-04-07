package com.dada_labs_two.chamavault.wallets.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.wallets.constants.WalletRole;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByOwnerReferenceAndWalletRole(UUID ownerReference, WalletRole  walletRole);
    Page<Wallet> findAllByOwnerReference(Pageable pageable,  UUID ownerReference);
    List<Wallet> findAllByOwnerReference(UUID ownerReference);

    Optional<Wallet> findByOwnerReferenceAndWalletTypeAndChamaAndActive(UUID ownerReference, WalletType walletType,
                                                               Chama chama, Boolean active);
    List<Wallet> findByActiveTrue();

    Optional<Wallet> findByWalletPurposeAndOwnerReferenceAndWalletTypeAndChamaAndActive(String walletPurpose,
                                                                                        UUID ownerReference,
                                                                                        WalletType walletType,
                                                                                        Chama chama, Boolean active);

    @Query("""
        SELECT w FROM Wallet w
        WHERE w.active = true
        AND (
            w.lastBalanceCheck IS NULL
            OR w.lastBalanceCheck < :cutoff
        )
    """)
    Page<Wallet> findWalletsToPoll(
            @Param("cutoff") Instant cutoff,
            Pageable pageable
    );

}
