package com.dada_labs_two.chamavault.wallets.repositories;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Page<Wallet> findAllByOwnerReference(Pageable pageable,  UUID ownerReference);
    List<Wallet> findAllByOwnerReference(UUID ownerReference);

    Optional<Wallet> findByOwnerReferenceAndWalletTypeAndChamaAndActive(UUID ownerReference, WalletType walletType,
                                                               Chama chama, Boolean active);
    List<Wallet> findByActiveTrue();

}
