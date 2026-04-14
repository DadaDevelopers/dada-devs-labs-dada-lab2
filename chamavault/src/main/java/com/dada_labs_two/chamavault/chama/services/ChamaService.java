package com.dada_labs_two.chamavault.chama.services;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.dtos.*;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaInvite;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.models.ChamaRules;
import com.dada_labs_two.chamavault.chama.repositories.ChamaInviteRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRulesRepository;
import com.dada_labs_two.chamavault.contributions.models.ContributionCycle;
import com.dada_labs_two.chamavault.contributions.repositories.ContributionCycleRepository;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.LnurlPayLinkResponse;
import com.dada_labs_two.chamavault.lightning.integration.LNbits.dtos.WalletResponse;
import com.dada_labs_two.chamavault.lightning.services.LightningWalletService;
import com.dada_labs_two.chamavault.project_commons.codes.dtos.CodeDTO;
import com.dada_labs_two.chamavault.project_commons.codes.models.Code;
import com.dada_labs_two.chamavault.project_commons.codes.services.CodeService;
import com.dada_labs_two.chamavault.project_commons.roles.services.RoleService;
import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.dtos.UsersDTO;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
import com.dada_labs_two.chamavault.users.services.UserService;
import com.dada_labs_two.chamavault.wallets.constants.WalletType;
import com.dada_labs_two.chamavault.wallets.models.Wallet;
import com.dada_labs_two.chamavault.wallets.repositories.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChamaService {
    private final ProfileActionService profileActionService;
    private final UserService userService;
    private final CodeService codeService;
    private final RoleService roleService;
    private final LightningWalletService lightningWalletService;

    private final UserRepository userRepository;
    private final ChamaRepository chamaRepository;
    private final ChamaMemberRepository chamaMemberRepository;
    private final WalletRepository walletRepository;
    private final ChamaRulesRepository chamaRulesRepository;
    private final ChamaInviteRepository chamaInviteRepository;
    private final ContributionCycleRepository contributionCycleRepository;

    @Transactional
    public Chama createChama(CreateChamaDTO createChamaDTO) {
        User creator  = userRepository.findById(createChamaDTO.getCreatorId()).orElseThrow();
        // 1. Create Chama
        Chama chama = chamaRepository.save(
                Chama.builder()
                        .name(createChamaDTO.getName())
                        .description(createChamaDTO.getDescription())
                        .iconUrl(createChamaDTO.getIconUrl())
                        .visibility(createChamaDTO.getVisibility())
                        .currentRotationIndex(0)
                        .contributionAmount(createChamaDTO.getContributionAmount())
                        .maxMembers(createChamaDTO.getMaxMembers())
                        .createdBy(creator)
                        .build()
        );

        // 2. Create Membership (creator)
        chamaMemberRepository.save(
                ChamaMember.builder()
                        .chama(chama)
                        .user(creator)
                        .role(ChamaRole.ADMIN)
                        .status(MembershipStatus.ACTIVE)
                        .build()
        );

        // 3. Create Group Wallet
        Wallet wallet = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CHAMA_GROUP)
                        .ownerReference(chama.getChamaReference())
                        .balanceSats(0L)
                        .chama(chama)
                        .active(true)
                        .build()
        );

        // 4. Create Rules
        chamaRulesRepository.save(
                ChamaRules.builder()
                        .chama(chama)
                        .contributionAmount(createChamaDTO.getContributionAmount())
                        .requiresApproval(createChamaDTO.getRequiresApproval())
                        .requiredApprovals(createChamaDTO.getRequiredApprovals())
                        .dailyLimitSats(createChamaDTO.getDailyLimitSats())
                        .frequency(createChamaDTO.getFrequency())
                        .build()
        );

        //5. Create Group lightning Wallet
        WalletResponse lw= lightningWalletService.createUserWallet(chama.getName());
        log.info("LW created user wallet: {}", lw);

        // We use the NEW wallet's admin key to enable the extension for itself
        lightningWalletService.enableLnurlpExtension(lw.id(),lw.adminkey());

        Map<String, String> lightningMap = new HashMap<>();
        lightningMap.put("id", lw.id());
        lightningMap.put("walletName", lw.name());
        lightningMap.put("adminkey", lw.adminkey());
        lightningMap.put("invoice_key", lw.invoice_key());
        lightningMap.put("wallet_type", lw.wallet_type());
        lightningMap.put("inkey", lw.inkey());
        lightningMap.put("shared_wallet_id", lw.shared_wallet_id());
        lightningMap.put("currency", lw.currency());
        lightningMap.put("balance_msat", lw.balance_msat());

        wallet.setLightning(lightningMap);
        wallet.setWalletPurpose("General wallet for the chama");
        wallet = walletRepository.save(wallet);

        //6. Assign group lightning  address
        String lnUsername = chama.getName()
                .toLowerCase()
                .replaceAll("[^a-z0-9_-]", "-");
        long min = 1_000;        // 1 sat
        long max = 1_000_000_000; // 1,000,000 sats
        LnurlPayLinkResponse lnAddress  = lightningWalletService.createLightningAddress(lw.adminkey(),
                "lightning address for chama group "+ chama.getName(),
                min, max, 0, lnUsername);
        log.info("LN address created: {}", lnAddress);
        wallet.getLightning().put("lnAddressUrl", lnAddress.lnurl());
        wallet.getLightning().put("lnAddressUsername", lnAddress.username());
        wallet = walletRepository.save(wallet);

        profileActionService.createProfileActions(creator, Activity.USER_REQUEST_ACCEPTED,"chama creation",
                "chama created successfully", chama.getDescription(), "[Admins]: Welcome to Chama!",
                ZonedDateTime.now().plusYears(100));

        return chama;
    }

    public Page<Chama> getChamas(Pageable pageable, ChamaVisibility visibility) {
        if(visibility == null) {
            return chamaRepository.findAll(pageable);
        }
        return chamaRepository.findAllByVisibility(pageable, visibility);
    }

    public ChamaDetailsDTO getChamaById(UUID chamaReference) {
        Chama chama = chamaRepository.findById(chamaReference).orElseThrow(()->
                new RuntimeException("Chama not found by reference: " + chamaReference));

        ChamaRules rules = chamaRulesRepository.findByChama(chama).orElse(null);

        List<Wallet> chamaWallets = walletRepository.findAllByOwnerReference(chama.getChamaReference());

        Page<ContributionCycle> contributionCycles = contributionCycleRepository.findAllByChama(null, chama);



        return ChamaDetailsDTO.builder()
                .chama(ChamaDTO.builder()
                        .chamaReference(chama.getChamaReference())
                        .name(chama.getName())
                        .description(chama.getDescription())
                        .contributionAmount(chama.getContributionAmount())
                        .iconUrl(chama.getIconUrl())
                        .visibility(chama.getVisibility())
                        .maxMembers(chama.getMaxMembers())
                        .currentRotationIndex(chama.getCurrentRotationIndex())
                        .createdAt(chama.getCreatedAt())
                        .deletedAt(chama.getDeletedAt())
                        .chamaCreator(ChamaCreatorDTO.builder()
                                .msisdn(chama.getCreatedBy().getMsisdn())
                                .username(chama.getCreatedBy().getUsername())
                                .build())
                        .build())
                .contributionCycles(contributionCycles.map(contributionCycle ->  {
                        List<String> usersAlreadyContributed = new ArrayList<>();

                        contributionCycle.getContributorWallets().stream().map(wallet -> {
                            UUID walletOwner = wallet.getOwnerReference();
                            User contributedUser = userRepository.findById(walletOwner).orElse(null);

                            if(contributedUser != null)
                                usersAlreadyContributed.add(contributedUser.getUsername());
                            return contributedUser.getUsername();
                        });

                    return ChamaContributionCycleDTO.builder()
                            .cycleReference(contributionCycle.getCycleReference())
                            .currentTotalContributionAmount(contributionCycle.getCurrentTotalContributionAmount())
                            .expectedTotalContributionAmount(contributionCycle.getExpectedTotalContributionAmount())
                            .beneficiaryName(contributionCycle.getBeneficiaryUser().getUser().getUsername())
                            .beneficiaryWalletReference(contributionCycle.getWallet().getWalletReference())
                            .rotationIndex(contributionCycle.getRotationIndex())
                            .status(contributionCycle.getStatus())
                            .startAt(contributionCycle.getStartAt())
                            .endAt(contributionCycle.getEndAt())
                            .usersAlreadyContributed(usersAlreadyContributed)
                            .build();
                }).stream().toList())
                .rules(rules == null? null : ChamaRulesDTO.builder()
                        .requiresApproval(rules.getRequiresApproval())
                        .contributionAmount(rules.getContributionAmount())
                        .requiredApprovals(rules.getRequiredApprovals())
                        .frequency(rules.getFrequency())
                        .build())
                .wallets(chamaWallets.stream().map(w ->  {

                    Map<String, String> lightningMap = new HashMap<>();
                    lightningMap.put("walletName", w.getLightning().get("walletName"));
                    lightningMap.put("currency", w.getLightning().get("currency"));
                    lightningMap.put("balance_msat", w.getLightning().get("balance_msat"));
                    lightningMap.put("lnAddressUrl", w.getLightning().get("lnAddressUrl"));
                    lightningMap.put("lnAddressUsername", w.getLightning().get("lnAddressUsername"));


                    return ChamaGroupWalletDTO.builder()
                            .walletPurpose(w.getWalletPurpose())
                            .walletReference(w.getWalletReference())
                            .walletType(w.getWalletType())
                            .balanceSats(w.getBalanceSats())
                            .lnBitsbalanceSats(w.getLnBitsbalanceSats())
                            .active(w.getActive())
                            .createdAt(w.getCreatedAt())
                            .lightning(lightningMap)
                            .build();
                    }).toList())
                .build();
    }

    public List<Chama> findChamasByUserMsisdn(String msisdn, MembershipStatus status) {
        return chamaMemberRepository
                .findChamasByUserMsisdn(msisdn, status);
    }

    public List<ChamaMember> findMembersByChamaAndStatus(UUID chamaId, MembershipStatus status) {
        return chamaMemberRepository.findMembersByChamaAndStatus(chamaId, status);
    }

    public ChamaInvite generateChamaInvite(CreateChamaInviteDTO chamaInviteDTO) {
        //check chama exists
        Chama chama = chamaRepository.findById(chamaInviteDTO.getChamaReferenceId()).orElseThrow(() ->
                new RuntimeException("Chama reference not found"));

        //generate invite code
        Code inviteCode = codeService.createCode(CodeDTO.builder()
                        .name("CHAMA_" + chamaInviteDTO.getChamaReferenceId())
                        .active(true)
                        .description(chama.getDescription())
                        .ownerMsisdn(chamaInviteDTO.getAdminPhone())
                        .expirationDate(ZonedDateTime.now().plusMonths(30))
                .build());

        ChamaInvite chamaInvite = chamaInviteRepository.save(ChamaInvite.builder()
                .chama(chama)
                        .role(chamaInviteDTO.getRole())
                        .inviteCode(inviteCode)
                        .requiresApproval(chamaInviteDTO.getRequiresApproval())
                        .used(false)
                        .paused(false)
                        .expiresAt(ZonedDateTime.now().plusMonths(30))
                .build());

        profileActionService.createProfileActions(userRepository.findByMsisdn(chamaInviteDTO.getAdminPhone()).orElseThrow(),
                Activity.COMPLETED,"create invite code",
                "chama invite code created successfully", chama.getDescription(),
                "[Admins]: Kindly note that the invite expires after "+ chamaInvite.getExpiresAt(),
                ZonedDateTime.now().plusMonths(30));

        return chamaInvite;
    }

    //need to be role managed, only admin of chama to perform this & action published
    public ChamaInvite pauseInvites(String inviteCode) {
        //get code
        Code code = codeService.findByCode(inviteCode).orElseThrow(() ->
                new RuntimeException("Invite code is not valid"));

        ChamaInvite invite = chamaInviteRepository.findByInviteCode(code).orElseThrow(() ->
                new RuntimeException("Invite code not found"));
        invite.setPaused(true);
        chamaInviteRepository.save(invite);

        return invite;
    }

    public Page<ChamaInvite> fetchChamaInviteCodes(Pageable pageable, UUID chamaReferenceId) {
        Chama chama = chamaRepository.findById(chamaReferenceId).orElseThrow(() ->
                new RuntimeException("Chama reference not found"));

        return chamaInviteRepository.findByChama(pageable, chama);
    }

    @Transactional
    public ChamaMember joinChamaByInviteCode(JoinChamaByInviteCodeDTO joinChamaByInviteCodeDTO) {
        //validate code
        Code inviteCode = codeService.findByCode(joinChamaByInviteCodeDTO.getInviteCode()).orElseThrow(() ->
                new RuntimeException("Invite code not valid"));

        //check invite is valid and not paused
        ChamaInvite chamaInvite = chamaInviteRepository.findByInviteCodeAndPausedFalse(inviteCode).orElseThrow(()
                -> new RuntimeException("Invite code not found or  has been paused"));

        //check invite not expired
        if (chamaInvite.getExpiresAt().isBefore(ZonedDateTime.now()))
            throw new RuntimeException("Invite expired");

        Chama currentChama = chamaInvite.getChama();

        //check max num of people reached
        long totalMembers = chamaMemberRepository.countByChama_ChamaReferenceAndStatusAndDeletedAtIsNull(
                currentChama.getChamaReference(), MembershipStatus.ACTIVE);
        if (currentChama.getMaxMembers() <= totalMembers) throw new RuntimeException("Chama max members exceeded");

        //check if user already a member
        if (chamaMemberRepository
                .existsByChama_ChamaReferenceAndUser_MsisdnAndDeletedAtIsNull(
                        currentChama.getChamaReference(), joinChamaByInviteCodeDTO.getMsisdn())) {
            throw new IllegalStateException("User already made a request to join the chama");
        }

        //check if user already registered
        User user = userRepository.findByMsisdn(joinChamaByInviteCodeDTO.getMsisdn()).orElse(null);

        //if not registered, registered
        if (user == null) {
            //register user
            user = userService.registerUser(UsersDTO.builder()
                            .msisdn(joinChamaByInviteCodeDTO.getMsisdn())
                            .password(joinChamaByInviteCodeDTO.getPassword())
                            .passwordReEntered(joinChamaByInviteCodeDTO.getPasswordReEntered())
                            .roles(Set.of(roleService.addRole("USER")))
                            .countries(joinChamaByInviteCodeDTO.getCountries())
                            .kyc(joinChamaByInviteCodeDTO.getKyc())
                            .username(joinChamaByInviteCodeDTO.getUsername())
                    .build());
        }

        var newChamaMember = addChamaMember(user, currentChama, chamaInvite.getRole());

        //mark code used
        chamaInvite.setUsed(true);
        chamaInviteRepository.save(chamaInvite);

        return newChamaMember;
    }

    public ChamaMember requestToJoinChama(UUID chamaId, ChamaRole role, String joinerPhone) {
        //validate chama is valid
        Chama chama = chamaRepository.findById(chamaId).orElseThrow(() -> new RuntimeException("Chama not found"));

        //validate chama is public
        if (chama.getVisibility() != ChamaVisibility.PUBLIC)
            throw new RuntimeException("Chama is private");

        //check max num of people reached
        long totalMembers = chamaMemberRepository.countByChama_ChamaReferenceAndStatusAndDeletedAtIsNull(
                chama.getChamaReference(), MembershipStatus.ACTIVE);
        if (chama.getMaxMembers() <= totalMembers) throw new RuntimeException("Chama max members exceeded");

        //check if user already registered
        User user = userRepository.findByMsisdn(joinerPhone).orElse(null);

        //if not registered, registered
        if (user == null) {
            //register user
            throw new IllegalStateException("Make sure you first register with us");
        }

        return addChamaMember(user, chama, role);
    }

    public Page<ChamaMember> fetchChamaMembersByStatus(Pageable pageable, UUID chamaReferenceId, MembershipStatus status) {
        return chamaMemberRepository.findAllByChama_ChamaReferenceAndStatus(chamaReferenceId, status, pageable);
    }

    //need to add functionality that admin only
    public ChamaMember approveUserRequestToJoinChama(UUID chamaId, String approverPhone, UUID prospectId,
                                                     MembershipStatus status, String action) {

        //fetch user
        User approver = userRepository.findByMsisdn(approverPhone).orElseThrow(() ->
                new RuntimeException("Approver does not exist in the system"));

        //fetch chama
        Chama chama = chamaRepository.findById(chamaId).orElseThrow(() ->new RuntimeException("Chama not found"));

        //check chama member
        ChamaMember chamaMember = chamaMemberRepository.findByUserAndChama(approver, chama).orElseThrow(() ->
                new RuntimeException("Approver passed is not a member of the chama"));

        if (!action.equalsIgnoreCase("approve")) {
            log.info("Not Approve chama member");
            return chamaMember;
        }

        //only admins get to approve
        if (chamaMember.getRole() != ChamaRole.ADMIN)
            throw new RuntimeException("Only admins can approve chama members");

        ChamaMember prospect = chamaMemberRepository.findById(prospectId).orElseThrow(() ->
                new RuntimeException("Prospect not found"));

        prospect.setStatus(status);
        prospect = chamaMemberRepository.save(prospect);

        profileActionService.createProfileActions(prospect.getUser(), Activity.USER_REQUEST_REJECTED,"join chama approval status",
                "requested to join chama: "+ chama.getName(), chama.getDescription(),
                "[Admins]: Your request to join chama!"+ chama.getName() +" was "+ status,
                ZonedDateTime.now());

        profileActionService.createProfileActions(chama.getCreatedBy(), Activity.USER_REQUEST_REJECTED,
                "join chama approval status",
                "requested to join your chama: "+ chama.getName(), chama.getDescription(),
                "[Admins]: Phew, that is off the bucket list",
                ZonedDateTime.now());


        return chamaMember;
    }

    public ChamaMember addChamaMember(User user, Chama chama, ChamaRole chamaRole) {
        ChamaMember chamaMember;

        //check max num of people reached
        long totalMembers = chamaMemberRepository.countByChama_ChamaReferenceAndStatusAndDeletedAtIsNull(
                chama.getChamaReference(), MembershipStatus.ACTIVE);
        if (chama.getMaxMembers() <= totalMembers) throw new RuntimeException("Chama max members exceeded");

        if (user != null) {
            chamaMember = chamaMemberRepository.save(ChamaMember.builder()
                    .chama(chama)
                    .user(user)
                    .role(chamaRole)
                    .status(MembershipStatus.PENDING)
                    .build());

            profileActionService.createProfileActions(user, Activity.WAITING,"join chama",
                    "requested to join chama: "+ chama.getName(), chama.getDescription(),
                    "[Admins]: Your request was received, currently awaiting approval from admin!",
                    ZonedDateTime.now().plusDays(100));

            profileActionService.createProfileActions(chama.getCreatedBy(), Activity.WAITING,"join chama request",
                    "requested to join your chama: "+ chama.getName(), chama.getDescription(),
                    "[Admins]: Request is awaiting your approval and will expire at "+ZonedDateTime.now().plusDays(100),
                    ZonedDateTime.now().plusDays(100));
        } else {
            throw  new RuntimeException("user is null");
        }

        return chamaMember;
    }
}
