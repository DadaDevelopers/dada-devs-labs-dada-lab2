package com.dada_labs_two.chamavault.contributions.services;

import com.dada_labs_two.chamavault.chama.constants.*;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.contributions.constants.*;
import com.dada_labs_two.chamavault.contributions.dtos.*;
import com.dada_labs_two.chamavault.contributions.models.*;
import com.dada_labs_two.chamavault.contributions.repositories.*;
import com.dada_labs_two.chamavault.fees.dtos.FeeQuote;
import com.dada_labs_two.chamavault.fees.services.FeeService;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.ZonedDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class MemberContributionObligationService {
    private final MemberContributionObligationRepository repository;
    private final ObligationPaymentRepository paymentRepository;
    private final ChamaMemberRepository memberRepository;
    private final WalletRepository walletRepository;
    private final LightningWalletService lightningWalletService;
    private final FeeService feeService;

    @Transactional
    public void createFor(PoolingCycle cycle, List<ChamaMember> members) {
        for (ChamaMember member : members) {
            if (repository.existsByMember_UserReferenceAndPoolingCycle_Reference(member.getUser().getUserReference(), cycle.getReference())) continue;
            repository.save(base(member, ContributionType.POOLING, cycle.getContributionAmount(), cycle.getEndAt())
                    .poolingCycle(cycle).build());
        }
    }

    @Transactional
    public void createFor(ContributionCycle cycle, List<ChamaMember> members, boolean beneficiaryContributes) {
        for (ChamaMember member : members) {
            if (!beneficiaryContributes && member.getReference().equals(cycle.getBeneficiaryUser().getReference())) continue;
            if (repository.existsByMember_UserReferenceAndContributionCycle_CycleReference(member.getUser().getUserReference(), cycle.getCycleReference())) continue;
            repository.save(base(member, ContributionType.MERRY_GO_ROUND, cycle.getContributionAmount(), cycle.getEndAt())
                    .contributionCycle(cycle).build());
        }
    }

    private MemberContributionObligation.MemberContributionObligationBuilder base(ChamaMember member, ContributionType type,
                                                                                   long amount, ZonedDateTime dueAt) {
        return MemberContributionObligation.builder().chama(member.getChama()).member(member.getUser()).type(type)
                .amountDueSats(amount).amountPaidSats(0L).dueAt(dueAt).status(ObligationStatus.PENDING);
    }

    public Page<ObligationDTO> list(UUID chamaId, User requester, boolean mine, ObligationStatus status, Pageable page) {
        assertMember(chamaId, requester);
        Page<MemberContributionObligation> result;
        if (mine && status != null) result = repository.findByChama_ChamaReferenceAndMember_UserReferenceAndStatus(chamaId, requester.getUserReference(), status, page);
        else if (mine) result = repository.findByChama_ChamaReferenceAndMember_UserReference(chamaId, requester.getUserReference(), page);
        else if (status != null) result = repository.findByChama_ChamaReferenceAndStatus(chamaId, status, page);
        else result = repository.findByChama_ChamaReference(chamaId, page);
        return result.map(this::dto);
    }

    @Transactional
    public ObligationPaymentResponse pay(UUID chamaId, UUID obligationId, User user, PayObligationRequest request) {
        assertMember(chamaId, user);
        MemberContributionObligation obligation = repository.findForUpdate(obligationId)
                .orElseThrow(() -> new IllegalArgumentException("Contribution obligation not found"));
        if (!obligation.getChama().getChamaReference().equals(chamaId)) throw new IllegalArgumentException("Obligation does not belong to this chama");
        if (!obligation.getMember().getUserReference().equals(user.getUserReference())) throw new SecurityException("Members may only pay their own obligations");
        if (EnumSet.of(ObligationStatus.PAID, ObligationStatus.WAIVED, ObligationStatus.SKIPPED).contains(obligation.getStatus()))
            throw new IllegalStateException("This obligation cannot receive payments");
        if (request.amountSats() > obligation.outstandingAmountSats()) throw new IllegalArgumentException("Payment exceeds outstanding obligation amount");

        Wallet destination = obligation.getType() == ContributionType.POOLING
                ? obligation.getPoolingCycle().getWallet() : obligation.getContributionCycle().getWallet();
        Wallet funding = walletRepository.findById(request.fundingWalletReference())
                .filter(w -> user.getUserReference().equals(w.getOwnerReference()) && Boolean.TRUE.equals(w.getActive()))
                .orElseThrow(() -> new SecurityException("Funding wallet is not owned by the contributor"));
        if (destination.getLightning() == null || destination.getLightning().get("inkey") == null ||
                funding.getLightning() == null || funding.getLightning().get("adminkey") == null)
            throw new IllegalStateException("Both wallets must have Lightning credentials");

        FeeQuote fee = feeService.quote(obligation.getType() == ContributionType.POOLING
                ? TransactionCategory.GROUP_WALLET_TOPUP : TransactionCategory.CHAMA_CONTRIBUTION, request.amountSats());
        String invoice = lightningWalletService.createInvoice(destination.getLightning().get("inkey"), request.amountSats(),
                "Payment for obligation " + obligation.getReference());
        String lightningReference = lightningWalletService.payInvoice(funding.getLightning().get("adminkey"), invoice);
        String feeReference = feeService.collect(funding, fee);

        long newPaid = Math.addExact(obligation.getAmountPaidSats(), request.amountSats());
        obligation.setAmountPaidSats(newPaid);
        obligation.setStatus(newPaid == obligation.getAmountDueSats() ? ObligationStatus.PAID : ObligationStatus.PARTIALLY_PAID);
        destination.setBalanceSats(Math.addExact(Optional.ofNullable(destination.getBalanceSats()).orElse(0L), request.amountSats()));
        long collected; long expected;
        if (obligation.getType() == ContributionType.POOLING) {
            PoolingCycle c = obligation.getPoolingCycle();
            c.setCurrentTotalContributionAmount(Math.addExact(c.getCurrentTotalContributionAmount(), request.amountSats()));
            collected = c.getCurrentTotalContributionAmount(); expected = c.getExpectedTotalContributionAmount();
        } else {
            ContributionCycle c = obligation.getContributionCycle();
            c.setCurrentTotalContributionAmount(Math.addExact(c.getCurrentTotalContributionAmount(), request.amountSats()));
            if (!c.getContributorWallets().contains(funding)) c.getContributorWallets().add(funding);
            collected = c.getCurrentTotalContributionAmount(); expected = c.getExpectedTotalContributionAmount();
        }
        ObligationPayment payment = paymentRepository.save(ObligationPayment.builder().obligation(obligation)
                .amountSats(request.amountSats()).platformFeeSats(fee.platformFeeSats()).feeRuleReference(fee.feeRuleReference())
                .paymentReference(lightningReference).feePaymentReference(feeReference).build());
        return new ObligationPaymentResponse(payment.getReference(), obligation.getReference(), request.amountSats(), newPaid,
                obligation.outstandingAmountSats(), obligation.getStatus(), collected, expected, fee.platformFeeSats(), fee.totalSats(), lightningReference);
    }

    private void assertMember(UUID chamaId, User user) {
        if (user == null || memberRepository.findByChama_ChamaReferenceAndUser_UserReferenceAndStatus(chamaId, user.getUserReference(), MembershipStatus.ACTIVE).isEmpty())
            throw new SecurityException("Only active chama members may access contribution obligations");
    }
    private ObligationDTO dto(MemberContributionObligation o) {
        String cycle = o.getType() == ContributionType.POOLING ? o.getPoolingCycle().getReference().toString()
                : o.getContributionCycle().getCycleReference().toString();
        ObligationStatus status = o.getStatus();
        if (o.getDueAt().isBefore(ZonedDateTime.now()) && (status == ObligationStatus.PENDING || status == ObligationStatus.PARTIALLY_PAID)) status = ObligationStatus.OVERDUE;
        return ObligationDTO.builder().reference(o.getReference()).chamaReference(o.getChama().getChamaReference())
                .memberReference(o.getMember().getUserReference()).type(o.getType()).cycleReference(cycle)
                .amountDueSats(o.getAmountDueSats()).amountPaidSats(o.getAmountPaidSats()).outstandingAmountSats(o.outstandingAmountSats())
                .dueAt(o.getDueAt()).status(status).build();
    }
}
