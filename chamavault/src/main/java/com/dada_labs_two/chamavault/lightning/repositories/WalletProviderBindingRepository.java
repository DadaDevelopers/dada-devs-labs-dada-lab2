package com.dada_labs_two.chamavault.lightning.repositories;

import com.dada_labs_two.chamavault.lightning.models.WalletProviderBinding;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface WalletProviderBindingRepository extends JpaRepository<WalletProviderBinding, UUID> {
    Optional<WalletProviderBinding> findByWalletAndActiveTrue(Wallet wallet);
    List<WalletProviderBinding> findAllByWalletOrderByActivatedAtAsc(Wallet wallet);
}
