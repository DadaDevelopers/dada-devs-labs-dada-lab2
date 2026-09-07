package com.dada_labs_two.chamavault.governance.services;

import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.models.*;
import com.dada_labs_two.chamavault.chama.repositories.*;
import com.dada_labs_two.chamavault.governance.constants.CheckerDecision;
import com.dada_labs_two.chamavault.governance.constants.GovernanceAction;
import com.dada_labs_two.chamavault.governance.constants.GovernanceRequestStatus;
import com.dada_labs_two.chamavault.governance.dtos.CastVoteRequest;
import com.dada_labs_two.chamavault.governance.dtos.CreateGovernanceRequest;
import com.dada_labs_two.chamavault.governance.models.ChamaFine;
import com.dada_labs_two.chamavault.governance.models.GovernanceRequest;
import com.dada_labs_two.chamavault.governance.models.GovernanceVote;
import com.dada_labs_two.chamavault.governance.repositories.ChamaFineRepository;
import com.dada_labs_two.chamavault.governance.repositories.GovernanceRequestRepository;
import com.dada_labs_two.chamavault.governance.repositories.GovernanceVoteRepository;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import com.dada_labs_two.chamavault.wallets.services.Bolt11Utils;
import com.dada_labs_two.chamavault.fees.services.FeeService;
import com.dada_labs_two.chamavault.fees.dtos.FeeQuote;
import com.dada_labs_two.chamavault.wallets.constants.TransactionCategory;
import com.dada_labs_two.chamavault.wallets.constants.TransactionSource;
import com.dada_labs_two.chamavault.wallets.constants.TransactionType;
import com.dada_labs_two.chamavault.wallets.models.Transaction;
import com.dada_labs_two.chamavault.wallets.repositories.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GovernanceService {
    private final GovernanceRequestRepository requestRepository;
    private final GovernanceVoteRepository voteRepository;
    private final ChamaFineRepository fineRepository;
    private final ChamaRepository chamaRepository;
    private final ChamaRulesRepository rulesRepository;
    private final ChamaMemberRepository memberRepository;
    private final WalletRepository walletRepository;
    private final ProfileActionService notifications;
    private final LightningWalletService lightningWalletService;
    private final FeeService feeService;
    private final TransactionRepository transactionRepository;

    @Transactional
    public GovernanceRequest create(UUID chamaId, User user, CreateGovernanceRequest input) {
        ChamaMember maker = activeMember(chamaId, user);
        ChamaRules rules = rulesRepository.findByChama(maker.getChama()).orElseThrow();
        int approvals = rules.getRequiredApprovals() == null ? 2 : rules.getRequiredApprovals();
        long eligibleCheckers = memberRepository.countByChama_ChamaReferenceAndStatus(chamaId, MembershipStatus.ACTIVE) - 1;
        if (approvals < 1 || approvals > eligibleCheckers)
            throw new IllegalStateException("Not enough eligible checkers for " + approvals + " approvals");
        validateParameters(input.action(), input.parameters());
        GovernanceRequest saved = requestRepository.save(
                GovernanceRequest.builder()
                        .chama(maker.getChama())
                        .maker(maker).action(input.action())
                        .parameters(input.parameters())
                        .reason(input.reason())
                        .requiredApprovals(approvals).status(GovernanceRequestStatus.PENDING)
                        .build()
        );
        notifyMembers(saved, "New maker request", user);
        return saved;
    }

    public Page<GovernanceRequest> list(UUID chamaId, User user, Pageable pageable) {
        activeMember(chamaId, user);
        return requestRepository.findByChama_ChamaReference(chamaId, pageable);
    }

    @Transactional
    public GovernanceRequest vote(UUID chamaId, UUID requestId, User user, CastVoteRequest input) {
        ChamaMember checker = activeMember(chamaId, user);
        GovernanceRequest request = requestRepository.findById(requestId).orElseThrow();

        if (!request.getChama().getChamaReference().equals(chamaId))
            throw new IllegalArgumentException("Request is not for this chama");

        if (request.getStatus() != GovernanceRequestStatus.PENDING)
            throw new IllegalStateException("Request is already decided");

        if (request.getMaker().getReference().equals(checker.getReference()))
            throw new IllegalStateException("Maker cannot check their own request");

        if (voteRepository.existsByRequestAndChecker(request, checker))
            throw new IllegalStateException("Member has already voted");

        voteRepository.save(
                GovernanceVote.builder()
                        .request(request)
                        .checker(checker)
                        .decision(input.decision())
                        .comment(input.comment())
                        .build());

        long votes = voteRepository.countByRequestAndDecision(request, input.decision());

        if (votes >= request.getRequiredApprovals()) {
            request.setDecidedAt(ZonedDateTime.now());
            if (input.decision() == CheckerDecision.DISAPPROVE)
                request.setStatus(GovernanceRequestStatus.REJECTED);
            else
                execute(request);

            requestRepository.save(request);

            notifyMembers(request, "Maker request " + request.getStatus().name().toLowerCase(), user);
        }
        return request;
    }

    private void execute(GovernanceRequest r) {
        Map<String, String> p = r.getParameters();
        Chama chama = r.getChama();
        ChamaRules rules = rulesRepository.findByChama(chama).orElseThrow();
        switch (r.getAction()) {
            case CREATE_GROUP_WALLET -> {
                WalletResponse lw = lightningWalletService.createUserWallet(chama.getName() + " group wallet");
                Map<String, String> lightning = new HashMap<>();
                lightning.put("id", lw.id());
                lightning.put("walletName", lw.name());
                lightning.put("adminkey", lw.adminkey());
                lightning.put("inkey", lw.inkey());
                lightning.put("invoice_key", lw.invoice_key());
                lightning.put("currency", lw.currency());
                walletRepository.save(Wallet.builder().walletType(WalletType.CHAMA_GROUP)
                        .ownerReference(chama.getChamaReference()).chama(chama).balanceSats(0L).lightning(lightning)
                        .targetAmountSats(longParam(p, "targetAmountSats")).walletPurpose(p.getOrDefault("purpose", "Chama group wallet"))
                        .active(true).build());
            }
            case WITHDRAW_GROUP_WALLET -> {
                Wallet wallet = groupWallet(chama, p);
                long amount = longParam(p, "amountSats");
                FeeQuote fee = feeService.quote(TransactionCategory.WITHDRAWAL, amount);
                if (wallet.getBalanceSats() < fee.totalSats())
                    throw new IllegalStateException("Insufficient group wallet balance including fee");
                if (wallet.getLightning() == null || wallet.getLightning().get("adminkey") == null)
                    throw new IllegalStateException("Group wallet has no Lightning credentials");
                String destination = required(p, "destination");
                if (Bolt11Utils.extractAmountSats(destination) != amount)
                    throw new IllegalArgumentException("Invoice amount must equal amountSats");
                if (Bolt11Utils.extractExpiry(destination).isBefore(ZonedDateTime.now()))
                    throw new IllegalArgumentException("Destination invoice is expired");
                String paymentHash = lightningWalletService.payInvoice(wallet.getLightning().get("adminkey"), destination);
                String feePaymentHash = feeService.collect(wallet, fee);
                wallet.setBalanceSats(wallet.getBalanceSats() - fee.totalSats());
                walletRepository.save(wallet);
                Map<String, String> metadata = new HashMap<>();
                metadata.put("governanceRequest", r.getReference().toString());
                metadata.put("destinationInvoiceHash", Bolt11Utils.extractPaymentHash(destination));
                metadata.put("platformFeeSats", String.valueOf(fee.platformFeeSats()));
                if (feePaymentHash != null) metadata.put("feePaymentHash", feePaymentHash);
                transactionRepository.save(Transaction.builder().wallet(wallet).type(TransactionType.DEBIT)
                        .source(TransactionSource.LN_INVOICE).category(TransactionCategory.WITHDRAWAL)
                        .amountSats(amount).platformFeeSats(fee.platformFeeSats()).feeSats(fee.platformFeeSats())
                        .feeRuleReference(fee.feeRuleReference()).externalRef(paymentHash)
                        .initiatedBy(r.getMaker().getUser().getUserReference()).memo(r.getReason())
                        .metadata(metadata).occurredAt(ZonedDateTime.now()).build());
            }
            case REMOVE_MEMBER -> {
                ChamaMember m = member(chama, p);
                m.setStatus(MembershipStatus.REMOVED);
                memberRepository.save(m);
            }
            case SUSPEND_MEMBER -> {
                ChamaMember m = member(chama, p);
                m.setStatus(MembershipStatus.SUSPENDED);
                memberRepository.save(m);
            }
            case ISSUE_FINE -> fineRepository.save(ChamaFine.builder().chama(chama).member(member(chama, p))
                    .amountSats(longParam(p, "amountSats")).reason(p.get("reason")).paid(false).build());
            case CHANGE_CONTRIBUTION_AMOUNT -> {
                long v = longParam(p, "contributionAmount");
                rules.setContributionAmount(v);
                chama.setContributionAmount(v);
                rulesRepository.save(rules);
                chamaRepository.save(chama);
            }
            case CHANGE_MAX_MEMBERS -> {
                int v = Math.toIntExact(longParam(p, "maxMembers"));
                if (v < memberRepository.countByChama_ChamaReferenceAndStatus(chama.getChamaReference(), MembershipStatus.ACTIVE))
                    throw new IllegalArgumentException("maxMembers is below active member count");
                chama.setMaxMembers(v);
                chamaRepository.save(chama);
            }
            case SKIP_ROTATION_MEMBER -> {
                chama.setCurrentRotationIndex(chama.getCurrentRotationIndex() + 1);
                chamaRepository.save(chama);
            }
            case CHANGE_CHAMA_CONFIG -> applyConfig(chama, rules, p);
        }
        r.setStatus(GovernanceRequestStatus.EXECUTED);
    }

    private void applyConfig(Chama c, ChamaRules rules, Map<String, String> p) {
        if (p.containsKey("description")) c.setDescription(p.get("description"));
        if (p.containsKey("requiredApprovals"))
            rules.setRequiredApprovals(Math.toIntExact(longParam(p, "requiredApprovals")));
        if (p.containsKey("dailyLimitSats")) rules.setDailyLimitSats(longParam(p, "dailyLimitSats"));
        chamaRepository.save(c);
        rulesRepository.save(rules);
    }

    private ChamaMember activeMember(UUID chamaId, User u) {
        return memberRepository
                .findByChama_ChamaReferenceAndUser_UserReferenceAndStatus(chamaId, u.getUserReference(), MembershipStatus.ACTIVE)
                .orElseThrow(() -> new SecurityException("Only active chama members may use governance"));
    }

    private ChamaMember member(Chama c, Map<String, String> p) {
        UUID id = UUID.fromString(required(p, "memberReference"));
        ChamaMember m = memberRepository.findById(id).orElseThrow();
        if (!m.getChama().getChamaReference().equals(c.getChamaReference()))
            throw new IllegalArgumentException("Member is not in chama");
        return m;
    }

    private Wallet groupWallet(Chama c, Map<String, String> p) {
        return walletRepository.findByWalletReferenceAndChama_ChamaReferenceAndWalletTypeAndActiveTrue(UUID.fromString(required(p, "walletReference")), c.getChamaReference(), WalletType.CHAMA_GROUP).orElseThrow();
    }

    private long longParam(Map<String, String> p, String key) {
        long value = Long.parseLong(required(p, key));
        if (value <= 0) throw new IllegalArgumentException(key + " must be positive");
        return value;
    }

    private String required(Map<String, String> p, String key) {
        String value = p.get(key);
        if (value == null || value.isBlank()) throw new IllegalArgumentException(key + " is required");
        return value;
    }

    private void validateParameters(GovernanceAction a, Map<String, String> p) {
        switch (a) {
            case CREATE_GROUP_WALLET -> longParam(p, "targetAmountSats");
            case WITHDRAW_GROUP_WALLET -> {
                required(p, "walletReference");
                longParam(p, "amountSats");
                required(p, "destination");
            }
            case REMOVE_MEMBER, SUSPEND_MEMBER -> required(p, "memberReference");
            case ISSUE_FINE -> {
                required(p, "memberReference");
                longParam(p, "amountSats");
            }
            case CHANGE_CONTRIBUTION_AMOUNT -> longParam(p, "contributionAmount");
            case CHANGE_MAX_MEMBERS -> longParam(p, "maxMembers");
            case SKIP_ROTATION_MEMBER -> required(p, "memberReference");
            case CHANGE_CHAMA_CONFIG -> {
                if (p.isEmpty()) throw new IllegalArgumentException("At least one config field is required");
            }
        }
    }

    private void notifyMembers(GovernanceRequest r, String subject, User actor) {
        memberRepository.findMembersByChamaAndStatus(r.getChama().getChamaReference(), MembershipStatus.ACTIVE).forEach(m -> notifications.notifyGovernance(m.getUser(), r.getChama(), subject, r.getAction().name(), actor.getUsername()));
    }
}
