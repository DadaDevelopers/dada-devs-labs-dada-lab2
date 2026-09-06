package com.dada_labs_two.chamavault.contributions.services;

import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.contributions.dtos.*;
import com.dada_labs_two.chamavault.contributions.models.GroupWalletContribution;
import com.dada_labs_two.chamavault.contributions.repositories.GroupWalletContributionRepository;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupWalletContributionService {
    private final ChamaMemberRepository memberRepository;
    private final WalletRepository walletRepository;
    private final GroupWalletContributionRepository contributionRepository;
    private final ProfileActionService notifications;
    private final LightningWalletService lightningWalletService;

    @Transactional
    public GroupWalletContributionResponse contribute(UUID chamaId, UUID walletId, User user,
                                                       GroupWalletContributionRequest request) {
        memberRepository.findByChama_ChamaReferenceAndUser_UserReferenceAndStatus(
                chamaId, user.getUserReference(), MembershipStatus.ACTIVE)
                .orElseThrow(() -> new SecurityException("Only active chama members can contribute"));
        Wallet wallet = walletRepository.findActiveChamaWalletForUpdate(
                walletId, chamaId, WalletType.CHAMA_GROUP)
                .orElseThrow(() -> new IllegalArgumentException("Active group wallet not found"));
        Wallet fundingWallet = walletRepository.findById(request.fundingWalletReference())
                .filter(w -> user.getUserReference().equals(w.getOwnerReference()))
                .filter(w -> Boolean.TRUE.equals(w.getActive()))
                .orElseThrow(() -> new SecurityException("Funding wallet is not owned by the contributor"));
        if (wallet.getLightning() == null || wallet.getLightning().get("inkey") == null ||
                fundingWallet.getLightning() == null || fundingWallet.getLightning().get("adminkey") == null)
            throw new IllegalStateException("Both wallets must have Lightning credentials");
        String invoice = lightningWalletService.createInvoice(wallet.getLightning().get("inkey"),
                request.amountSats(), "Contribution to " + wallet.getChama().getName());
        String paymentReference = lightningWalletService.payInvoice(
                fundingWallet.getLightning().get("adminkey"), invoice);
        wallet.setBalanceSats(Math.addExact(wallet.getBalanceSats(), request.amountSats()));
        walletRepository.save(wallet);
        GroupWalletContribution saved = contributionRepository.save(GroupWalletContribution.builder()
                .chama(wallet.getChama()).wallet(wallet).contributor(user)
                .amountSats(request.amountSats()).externalReference(paymentReference).build());
        long target = wallet.getTargetAmountSats() == null ? 0 : wallet.getTargetAmountSats();
        notifications.notifyGroupWalletContribution(user, wallet.getChama(), request.amountSats(),
                wallet.getBalanceSats(), wallet.getTargetAmountSats());
        return new GroupWalletContributionResponse(saved.getReference(), walletId, request.amountSats(),
                wallet.getBalanceSats(), wallet.getTargetAmountSats(), Math.max(0, target - wallet.getBalanceSats()),
                paymentReference, saved.getContributedAt());
    }
}
