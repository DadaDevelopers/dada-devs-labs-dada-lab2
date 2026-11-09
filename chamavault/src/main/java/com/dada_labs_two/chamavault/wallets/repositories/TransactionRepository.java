package com.dada_labs_two.chamavault.wallets.repositories;

import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.List;
import java.util.Collection;
import com.dada_labs_two.chamavault.payments.constants.TransactionStatus;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>,
        JpaSpecificationExecutor<Transaction> {
    Page<Transaction> findByRotationIndex(Integer rotationIndex, Pageable pageable);
    boolean existsByExternalRef(String externalRef);
    List<Transaction> findTop100ByStatusOrderByOccurredAtAsc(TransactionStatus status);
    boolean existsByWalletAndStatusIn(Wallet wallet, Collection<TransactionStatus> statuses);

    @Query("""
    SELECT COALESCE(
        SUM(
            CASE
                WHEN t.type = 'CREDIT'
                    THEN t.amountSats
                WHEN t.type = 'DEBIT'
                    THEN -(t.amountSats + COALESCE(t.feeSats, 0))
                ELSE 0
            END
        ), 0)
    FROM Transaction t
    WHERE t.wallet = :wallet
      AND (t.status IS NULL OR t.status = 'COMPLETED')
""")
    Long sumBalanceByWallet(@Param("wallet") Wallet wallet);

}
