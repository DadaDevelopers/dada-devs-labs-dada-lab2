package com.dada_labs_two.chamavault.wallets.repositories;

import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Page<Transaction> findByRotationIndex(Integer rotationIndex, Pageable pageable);
    boolean existsByExternalRef(String externalRef);

    @Query("""
        SELECT COALESCE(
            SUM(
                CASE
                    WHEN t.type = 'CREDIT' THEN t.amountSats
                    WHEN t.type = 'DEBIT' THEN -t.amountSats
                    ELSE 0
                END
            ), 0)
        FROM Transaction t
        WHERE t.wallet = :wallet
    """)
    Long sumBalanceByWallet(@Param("wallet") Wallet wallet);
}
