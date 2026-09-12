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
import com.dada_labs_two.chamavault.governance.models.RotationSkip;
import com.dada_labs_two.chamavault.governance.repositories.RotationSkipRepository;
import com.dada_labs_two.chamavault.contributions.constants.ContributionType;
import com.dada_labs_two.chamavault.chama.constants.ContributionFrequency;
import com.dada_labs_two.chamavault.chama.activities.*;
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
    private final RotationSkipRepository rotationSkipRepository;
    private final ChamaActivityService activityService;

    @Transactional
    public GovernanceRequest create(UUID chamaId, User user, CreateGovernanceRequest input) {
        ChamaMember maker = activeMember(chamaId, user);
        ChamaRules rules = rulesRepository.findByChama(maker.getChama()).orElseThrow();
        boolean requiresApproval = requiresApprovalFor(input.action(), input.parameters(), rules, maker.getChama());
        int approvals = requiresApproval ? approvalsFor(input.action(), input.parameters(), rules, maker.getChama()) : 0;
        long eligibleCheckers = memberRepository.countByChama_ChamaReferenceAndStatus(chamaId, MembershipStatus.ACTIVE) - 1;
        if (requiresApproval && (approvals < 1 || approvals > eligibleCheckers))
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
        if (!requiresApproval) {
            execute(saved);
            saved.setDecidedAt(ZonedDateTime.now());
            saved = requestRepository.save(saved);
        }
        activityService.record(maker.getChama(), user, ChamaActivityType.GOVERNANCE_REQUEST_CREATED, ActivityCategory.GOVERNANCE,
                "Governance request created", user.getUsername() + " created a " + input.action() + " request",
                "GOVERNANCE_REQUEST", saved.getReference().toString(), null, null, null, saved.getReference(),
                "GOVERNANCE_REQUEST_CREATED:" + saved.getReference(), Map.of("action", input.action().name(), "status", saved.getStatus().name()));
        if (!requiresApproval) recordGovernanceOutcome(saved, user);
        notifyMembers(saved, requiresApproval ? "New maker request" : "Maker request executed", user);
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
        activityService.record(request.getChama(), user, ChamaActivityType.GOVERNANCE_VOTE_CAST, ActivityCategory.GOVERNANCE,
                "Governance vote cast", user.getUsername() + " voted " + input.decision(), "GOVERNANCE_REQUEST",
                request.getReference().toString(), null, null, null, request.getReference(),
                "GOVERNANCE_VOTE:" + request.getReference() + ":" + checker.getReference(), Map.of("decision", input.decision().name()));

        long votes = voteRepository.countByRequestAndDecision(request, input.decision());

        if (votes >= request.getRequiredApprovals()) {
            request.setDecidedAt(ZonedDateTime.now());
            if (input.decision() == CheckerDecision.DISAPPROVE)
                request.setStatus(GovernanceRequestStatus.REJECTED);
            else
                execute(request);

            requestRepository.save(request);

            notifyMembers(request, "Maker request " + request.getStatus().name().toLowerCase(), user);
            recordGovernanceOutcome(request, user);
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
                Wallet wallet = governedWallet(chama, p);
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
                ContributionType type = contributionType(p);
                if (type == ContributionType.POOLING) rules.setPoolingContributionAmount(v);
                else {
                    rules.setMerryGoRoundContributionAmount(v);
                    chama.setContributionAmount(v);
                }
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
                ChamaMember skipped = member(chama, p);
                if (rotationSkipRepository.existsByChama_ChamaReferenceAndMember_ReferenceAndConsumedAtIsNull(
                        chama.getChamaReference(), skipped.getReference()))
                    throw new IllegalStateException("Member already has a pending rotation skip");
                rotationSkipRepository.save(RotationSkip.builder().chama(chama).member(skipped).governanceRequest(r).build());
            }
            case CHANGE_CHAMA_CONFIG -> applyConfig(chama, rules, p);
        }
        r.setStatus(GovernanceRequestStatus.EXECUTED);
        ChamaActivityType actionType = switch (r.getAction()) {
            case WITHDRAW_GROUP_WALLET -> ChamaActivityType.PAYOUT_COMPLETED;
            case CREATE_GROUP_WALLET -> ChamaActivityType.POOLING_WALLET_CREATED;
            case REMOVE_MEMBER -> ChamaActivityType.MEMBER_REMOVED;
            case SUSPEND_MEMBER -> ChamaActivityType.MEMBER_SUSPENDED;
            case ISSUE_FINE -> ChamaActivityType.FINE_ISSUED;
            case CHANGE_CONTRIBUTION_AMOUNT -> ChamaActivityType.CONTRIBUTION_AMOUNT_CHANGED;
            case CHANGE_MAX_MEMBERS -> ChamaActivityType.MAXIMUM_MEMBERS_CHANGED;
            case SKIP_ROTATION_MEMBER -> ChamaActivityType.ROTATION_MEMBER_SKIPPED;
            case CHANGE_CHAMA_CONFIG -> ChamaActivityType.CHAMA_CONFIG_CHANGED;
        };
        ActivityCategory category = switch (r.getAction()) {
            case WITHDRAW_GROUP_WALLET -> ActivityCategory.PAYOUT;
            case CREATE_GROUP_WALLET -> ActivityCategory.WALLET;
            case REMOVE_MEMBER, SUSPEND_MEMBER -> ActivityCategory.MEMBERSHIP;
            case ISSUE_FINE -> ActivityCategory.FINE;
            case SKIP_ROTATION_MEMBER -> ActivityCategory.ROTATION;
            default -> ActivityCategory.CONFIGURATION;
        };
        activityService.record(chama, r.getMaker().getUser(), actionType, category, "Governance action executed",
                r.getAction() + " was executed", "GOVERNANCE_REQUEST", r.getReference().toString(),
                p.containsKey("amountSats") ? Long.valueOf(p.get("amountSats")) : null,
                p.containsKey("walletReference") ? UUID.fromString(p.get("walletReference")) : null,
                null, r.getReference(), "GOVERNANCE_ACTION_EXECUTED:" + r.getReference(), Map.of("action", r.getAction().name()));
    }

    private void applyConfig(Chama c, ChamaRules rules, Map<String, String> p) {
        if (p.containsKey("description")) c.setDescription(p.get("description"));
        if (p.containsKey("requiredApprovals"))
            rules.setRequiredApprovals(Math.toIntExact(longParam(p, "requiredApprovals")));
        if (p.containsKey("dailyLimitSats")) rules.setDailyLimitSats(longParam(p, "dailyLimitSats"));
        if (p.containsKey("poolingFrequency")) rules.setPoolingFrequency(enumParam(p, "poolingFrequency", ContributionFrequency.class));
        if (p.containsKey("merryGoRoundFrequency")) rules.setMerryGoRoundFrequency(enumParam(p, "merryGoRoundFrequency", ContributionFrequency.class));
        if (p.containsKey("beneficiaryContributes")) rules.setBeneficiaryContributes(booleanParam(p, "beneficiaryContributes"));
        if (p.containsKey("poolingRequiresApproval")) rules.setPoolingRequiresApproval(booleanParam(p, "poolingRequiresApproval"));
        if (p.containsKey("poolingRequiredApprovals")) rules.setPoolingRequiredApprovals(Math.toIntExact(longParam(p, "poolingRequiredApprovals")));
        if (p.containsKey("merryGoRoundRequiresApproval")) rules.setMerryGoRoundRequiresApproval(booleanParam(p, "merryGoRoundRequiresApproval"));
        if (p.containsKey("merryGoRoundRequiredApprovals")) rules.setMerryGoRoundRequiredApprovals(Math.toIntExact(longParam(p, "merryGoRoundRequiredApprovals")));
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

    private Wallet governedWallet(Chama c, Map<String, String> p) {
        Wallet wallet = walletRepository.findById(UUID.fromString(required(p, "walletReference"))).orElseThrow();
        if (wallet.getChama() == null || !wallet.getChama().getChamaReference().equals(c.getChamaReference()) ||
                !Boolean.TRUE.equals(wallet.getActive()) ||
                (wallet.getWalletType() != WalletType.CHAMA_GROUP && wallet.getWalletType() != WalletType.CONTRIBUTION))
            throw new IllegalArgumentException("Active pooled or merry-go-round wallet not found for chama");
        return wallet;
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
            case CHANGE_CONTRIBUTION_AMOUNT -> {
                contributionType(p);
                longParam(p, "contributionAmount");
            }
            case CHANGE_MAX_MEMBERS -> longParam(p, "maxMembers");
            case SKIP_ROTATION_MEMBER -> required(p, "memberReference");
            case CHANGE_CHAMA_CONFIG -> {
                if (p.isEmpty()) throw new IllegalArgumentException("At least one config field is required");
            }
        }
    }

    private int approvalsFor(GovernanceAction action, Map<String, String> parameters, ChamaRules rules, Chama chama) {
        ContributionType type = actionType(action, parameters, chama);
        if (type == ContributionType.POOLING && rules.getPoolingRequiredApprovals() != null && rules.getPoolingRequiredApprovals() > 0)
            return rules.getPoolingRequiredApprovals();
        if (type == ContributionType.MERRY_GO_ROUND && rules.getMerryGoRoundRequiredApprovals() != null && rules.getMerryGoRoundRequiredApprovals() > 0)
            return rules.getMerryGoRoundRequiredApprovals();
        return rules.getRequiredApprovals() == null || rules.getRequiredApprovals() < 1 ? 2 : rules.getRequiredApprovals();
    }

    private boolean requiresApprovalFor(GovernanceAction action, Map<String, String> parameters, ChamaRules rules, Chama chama) {
        ContributionType type = actionType(action, parameters, chama);
        if (type == ContributionType.POOLING && rules.getPoolingRequiresApproval() != null)
            return rules.getPoolingRequiresApproval();
        if (type == ContributionType.MERRY_GO_ROUND && rules.getMerryGoRoundRequiresApproval() != null)
            return rules.getMerryGoRoundRequiresApproval();
        return rules.getRequiresApproval() == null || rules.getRequiresApproval();
    }

    private ContributionType actionType(GovernanceAction action, Map<String, String> parameters, Chama chama) {
        if (action == GovernanceAction.CREATE_GROUP_WALLET) return ContributionType.POOLING;
        if (action == GovernanceAction.CHANGE_CONTRIBUTION_AMOUNT) return contributionType(parameters);
        if (action == GovernanceAction.WITHDRAW_GROUP_WALLET) {
            Wallet wallet = governedWallet(chama, parameters);
            return wallet.getWalletType() == WalletType.CONTRIBUTION ? ContributionType.MERRY_GO_ROUND : ContributionType.POOLING;
        }
        if (action == GovernanceAction.SKIP_ROTATION_MEMBER) return ContributionType.MERRY_GO_ROUND;
        if (action == GovernanceAction.CHANGE_CHAMA_CONFIG && parameters.containsKey("contributionType"))
            return contributionType(parameters);
        return null;
    }

    private ContributionType contributionType(Map<String, String> p) {
        return enumParam(p, "contributionType", ContributionType.class);
    }

    private boolean booleanParam(Map<String, String> p, String key) {
        String value = required(p, key);
        if (!value.equalsIgnoreCase("true") && !value.equalsIgnoreCase("false"))
            throw new IllegalArgumentException(key + " must be true or false");
        return Boolean.parseBoolean(value);
    }

    private <E extends Enum<E>> E enumParam(Map<String, String> p, String key, Class<E> type) {
        try { return Enum.valueOf(type, required(p, key).toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid " + key); }
    }

    private void notifyMembers(GovernanceRequest r, String subject, User actor) {
        memberRepository.findMembersByChamaAndStatus(r.getChama().getChamaReference(), MembershipStatus.ACTIVE).forEach(m -> notifications.notifyGovernance(m.getUser(), r.getChama(), subject, r.getAction().name(), actor.getUsername()));
    }

    private void recordGovernanceOutcome(GovernanceRequest request, User actor) {
        ChamaActivityType type = request.getStatus() == GovernanceRequestStatus.REJECTED
                ? ChamaActivityType.GOVERNANCE_REQUEST_REJECTED :
                request.getStatus() == GovernanceRequestStatus.EXECUTED
                        ? ChamaActivityType.GOVERNANCE_REQUEST_EXECUTED : ChamaActivityType.GOVERNANCE_REQUEST_APPROVED;
        activityService.record(request.getChama(), actor, type, ActivityCategory.GOVERNANCE,
                "Governance request " + request.getStatus().name().toLowerCase(),
                request.getAction() + " request is " + request.getStatus().name().toLowerCase(), "GOVERNANCE_REQUEST",
                request.getReference().toString(), null, null, null, request.getReference(),
                "GOVERNANCE_OUTCOME:" + request.getReference(), Map.of("action", request.getAction().name(), "status", request.getStatus().name()));
    }
}
