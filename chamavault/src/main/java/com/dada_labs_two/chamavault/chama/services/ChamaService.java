package com.dada_labs_two.chamavault.chama.services;

import com.dada_labs_two.chamavault.chama.constants.ChamaRole;
import com.dada_labs_two.chamavault.chama.constants.ChamaVisibility;
import com.dada_labs_two.chamavault.chama.constants.MembershipStatus;
import com.dada_labs_two.chamavault.chama.dtos.CreateChamaDTO;
import com.dada_labs_two.chamavault.chama.models.Chama;
import com.dada_labs_two.chamavault.chama.models.ChamaMember;
import com.dada_labs_two.chamavault.chama.models.ChamaRules;
import com.dada_labs_two.chamavault.chama.repositories.ChamaMemberRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRepository;
import com.dada_labs_two.chamavault.chama.repositories.ChamaRulesRepository;
import com.dada_labs_two.chamavault.users.constants.Activity;
import com.dada_labs_two.chamavault.users.models.User;
import com.dada_labs_two.chamavault.users.repository.UserRepository;
import com.dada_labs_two.chamavault.users.services.ProfileActionService;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class ChamaService {
    private final ProfileActionService profileActionService;

    private final UserRepository userRepository;
    private final ChamaRepository chamaRepository;
    private final ChamaMemberRepository chamaMemberRepository;
    private final WalletRepository walletRepository;
    private final ChamaRulesRepository chamaRulesRepository;

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
        walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.CHAMA_GROUP)
                        .ownerReference(chama.getChamaReference())
                        .balanceSats(0L)
                        .active(true)
                        .build()
        );

        // 4. Create Rules
        chamaRulesRepository.save(
                ChamaRules.builder()
                        .chama(chama)
                        .requiresApproval(createChamaDTO.getRequiresApproval())
                        .requiredApprovals(createChamaDTO.getRequiredApprovals())
                        .dailyLimitSats(createChamaDTO.getDailyLimitSats())
                        .build()
        );

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
}
