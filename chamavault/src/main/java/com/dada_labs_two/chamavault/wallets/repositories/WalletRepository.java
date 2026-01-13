package com.dada_labs_two.chamavault.wallets.repositories;

import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Page<Wallet> findAllByOwnerReference(Pageable pageable,  UUID ownerReference);
}
