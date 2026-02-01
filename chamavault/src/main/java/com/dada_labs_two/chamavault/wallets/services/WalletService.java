package com.dada_labs_two.chamavault.wallets.services;

import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRepository;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletDetails;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.dtos.CreateWalletDTO;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {
    private final LightningWalletService lightningWalletService;
    private final WalletRepository walletRepository;
    private final ChamaRepository chamaRepository;
    private final UserRepository userRepository;

    public Page<Wallet> findAllByOwnerReference(Pageable pageable, UUID ownerReference) {
        return walletRepository.findAllByOwnerReference(pageable, ownerReference).map(wallet -> {
            updateSingleWallet(wallet);
            return wallet;
        });
    }

    public Wallet createUserWallet(String msisdn, String walletName) {
        User user = userRepository.findByMsisdn(msisdn).orElseThrow(() ->
                new RuntimeException("User is not registered in the system"));

        Wallet wallet = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.PERSONAL)
                        .ownerReference(user.getUserReference())
                        .balanceSats(0L)
                        .active(true)
                        .build()
        );

        WalletResponse lw= lightningWalletService.createUserWallet(walletName);
        log.info("LW created user wallet: {}", lw);
        Map<String, String> lightningMap = new HashMap<>();
        lightningMap.put("id", lw.id());
        lightningMap.put("name", lw.name());
        lightningMap.put("adminkey", lw.adminkey());
        lightningMap.put("invoice_key", lw.invoice_key());
        lightningMap.put("wallet_type", lw.wallet_type());
        lightningMap.put("inkey", lw.inkey());
        lightningMap.put("shared_wallet_id", lw.shared_wallet_id());
        lightningMap.put("currency", lw.currency());
        lightningMap.put("balance_msat", lw.balance_msat());
        wallet.setLightning(lightningMap);
        wallet = walletRepository.save(wallet);

        return wallet;
    }

    public Wallet createWallet(CreateWalletDTO createWalletDTO) {
        Chama chama =  chamaRepository.getReferenceById(createWalletDTO.getChamaAffiliationRef());

        Wallet wallet = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CHAMA_GROUP)
                        .ownerReference(createWalletDTO.getOwnerReference())
                        .balanceSats(0L)
                        .chama(chama)
                        .active(true)
                        .build()
        );

        WalletResponse lw= lightningWalletService.createUserWallet(createWalletDTO.getName());
        log.info("LW created user wallet: {}", lw);
        Map<String, String> lightningMap = new HashMap<>();
        lightningMap.put("id", lw.id());
        lightningMap.put("name", lw.name());
        lightningMap.put("adminkey", lw.adminkey());
        lightningMap.put("invoice_key", lw.invoice_key());
        lightningMap.put("wallet_type", lw.wallet_type());
        lightningMap.put("inkey", lw.inkey());
        lightningMap.put("shared_wallet_id", lw.shared_wallet_id());
        lightningMap.put("currency", lw.currency());
        lightningMap.put("balance_msat", lw.balance_msat());
        wallet.setLightning(lightningMap);
        wallet = walletRepository.save(wallet);

        return wallet;

    }

    @Scheduled(fixedDelayString = "${wallet.poller.delay-ms:30000}")
    void updateWalletBalance() {

        log.info("Starting paged wallet balance update");

        Instant cutoff = Instant.now().minus(Duration.ofMinutes(5));
        Pageable pageable = PageRequest.of(0, 100);

        Page<Wallet> page;

        do {
            page = walletRepository.findWalletsToPoll(cutoff, pageable);

            for (Wallet wallet : page.getContent()) {
                updateSingleWallet(wallet);
            }

            pageable = page.hasNext() ? page.nextPageable() : Pageable.unpaged();

        } while (page.hasNext());
    }

    @Transactional
    public Wallet updateSingleWallet(Wallet wallet) {

        if (wallet.getLightning() == null || StringUtils.isBlank(wallet.getLightning().get("inkey"))) {
            log.info("No input wallet found for wallet: {}", wallet);
            return null;
        }

        WalletDetails details =
                lightningWalletService.getUserWallet(wallet.getLightning().get("inkey"));

        long remoteBalance = details.balance();
        long localBalance = wallet.getLnBitsbalanceSats() == null ? 0L : wallet.getLnBitsbalanceSats();

        if (!Objects.equals(localBalance, remoteBalance)) {

            log.info("updating balance for wallet: {} from locale balance of {} to remote balance of {}",
                    wallet.getWalletReference(), localBalance, remoteBalance);
            wallet.setLnBitsbalanceSats(remoteBalance/1000);
            wallet.setBalanceSats(remoteBalance);
            wallet.setLastActivityAt(Instant.now());
        }

        wallet.setLastBalanceCheck(Instant.now());
        return walletRepository.save(wallet);
    }




}
